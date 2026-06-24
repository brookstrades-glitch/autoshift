import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { calcRecommendedDownPayment } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Honeypot check
  if (body.honeypot) return NextResponse.json({ id: 'ok' }, { status: 201 });

  const photoUrls: string[] = Array.isArray(body.photo_urls) ? body.photo_urls : [];
  if (photoUrls.length === 0) {
    return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 });
  }

  const payload = {
    source: 'seller',
    status: 'pending',
    first_name: body.first_name as string,
    last_name: body.last_name as string,
    phone: body.phone as string,
    email: body.email as string,
    year: Number(body.year),
    make: body.make as string,
    model: body.model as string,
    color: body.color as string,
    vehicle_type: body.vehicle_type as string,
    mileage: body.mileage ? Number(body.mileage) : null,
    monthly_payment: Number(body.monthly_payment),
    payments_left: Number(body.payments_left),
    lender: body.lender as string,
    balance: body.balance ? Number(body.balance) : null,
    down_payment: body.down_payment ? Number(body.down_payment) : null,
    comfort_level: 'maybe',
    seller_reason: body.seller_reason as string,
    photo_urls: photoUrls,
    vin: body.vin ? (body.vin as string).toUpperCase() : null,
    recommended_down_payment: calcRecommendedDownPayment(body.balance ? Number(body.balance) : null),
  };

  const db = supabaseAdmin();
  const { data, error } = await db.from('submissions').insert(payload).select('id').single();
  if (error) {
    console.error('[submissions] insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
