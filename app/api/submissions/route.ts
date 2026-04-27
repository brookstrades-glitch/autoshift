import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  // Honeypot check
  const honeypot = formData.get('website');
  if (honeypot) return NextResponse.json({ id: 'ok' }, { status: 201 });

  // Photos are uploaded client-side; we receive public URLs only
  const photoUrls = formData.getAll('photo_urls') as string[];
  if (photoUrls.length === 0) {
    return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 });
  }

  const db = supabaseAdmin();

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
  if (error) {
    console.error('[submissions] insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
