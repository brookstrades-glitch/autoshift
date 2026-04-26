import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from('submissions').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const photos = formData.getAll('photos') as File[];
  if (photos.length === 0) {
    return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 });
  }
  const db = supabaseAdmin();
  const photoUrls: string[] = [];
  for (const photo of photos) {
    const ext = photo.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buf = await photo.arrayBuffer();
    await db.storage.from('vehicle-photos').upload(filename, buf, { contentType: photo.type });
    const { data } = db.storage.from('vehicle-photos').getPublicUrl(filename);
    photoUrls.push(data.publicUrl);
  }
  const payload = {
    source: 'admin', status: 'live',
    year: Number(formData.get('year')), make: formData.get('make') as string,
    model: formData.get('model') as string, color: formData.get('color') as string,
    vehicle_type: formData.get('vehicle_type') as string,
    mileage: formData.get('mileage') ? Number(formData.get('mileage')) : null,
    monthly_payment: Number(formData.get('monthly_payment')),
    payments_left: Number(formData.get('payments_left')),
    lender: formData.get('lender') as string,
    balance: formData.get('balance') ? Number(formData.get('balance')) : null,
    comfort_level: formData.get('comfort_level') as string,
    photo_urls: photoUrls,
  };
  const { data, error } = await db.from('submissions').insert(payload).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  const { data, error } = await supabaseAdmin()
    .from('submissions').update(updates).eq('id', id).select('id,status').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}