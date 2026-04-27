import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  // Honeypot check
  const honeypot = formData.get('website');
  if (honeypot) return NextResponse.json({ id: 'ok' }, { status: 201 });

  const photos = formData.getAll('photos') as File[];
  if (photos.length === 0) {
    return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 });
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const MAX_BYTES = 15 * 1024 * 1024; // 15 MB per photo

  for (const photo of photos) {
    if (!ALLOWED_TYPES.includes(photo.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${photo.type}. Use JPEG, PNG, WebP, or HEIC.` }, { status: 400 });
    }
    if (photo.size > MAX_BYTES) {
      return NextResponse.json({ error: `Photo "${photo.name}" exceeds 15 MB limit.` }, { status: 400 });
    }
  }

  const db = supabaseAdmin();
  const photoUrls: string[] = [];
  const uploadedPaths: string[] = [];

  for (const photo of photos) {
    const ext = photo.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await photo.arrayBuffer();
    const { error } = await db.storage.from('vehicle-photos').upload(filename, arrayBuffer, { contentType: photo.type });
    if (error) {
      // Clean up any photos already uploaded in this batch
      if (uploadedPaths.length > 0) {
        await db.storage.from('vehicle-photos').remove(uploadedPaths);
      }
      return NextResponse.json({ error: 'Photo upload failed' }, { status: 500 });
    }
    uploadedPaths.push(filename);
    const { data: urlData } = db.storage.from('vehicle-photos').getPublicUrl(filename);
    photoUrls.push(urlData.publicUrl);
  }

  const payload = {
    source: 'seller',
    status: 'pending',
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    year: Number(formData.get('year')),
    make: formData.get('make') as string,
    model: formData.get('model') as string,
    color: formData.get('color') as string,
    vehicle_type: formData.get('vehicle_type') as string,
    mileage: formData.get('mileage') ? Number(formData.get('mileage')) : null,
    monthly_payment: Number(formData.get('monthly_payment')),
    payments_left: Number(formData.get('payments_left')),
    lender: formData.get('lender') as string,
    balance: formData.get('balance') ? Number(formData.get('balance')) : null,
    comfort_level: formData.get('comfort_level') as string,
    seller_reason: formData.get('seller_reason') as string,
    photo_urls: photoUrls,
  };

  const { data, error } = await db.from('submissions').insert(payload).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}