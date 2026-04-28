import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from('submissions').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const photoUrls: string[] = Array.isArray(body.photo_urls) ? body.photo_urls : [];
  if (photoUrls.length === 0) {
    return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 });
  }
  const payload = {
    source: 'admin', status: 'live',
    year: Number(body.year), make: body.make as string,
    model: body.model as string, color: body.color as string,
    vehicle_type: body.vehicle_type as string,
    mileage: body.mileage ? Number(body.mileage) : null,
    monthly_payment: Number(body.monthly_payment),
    payments_left: Number(body.payments_left),
    lender: body.lender as string,
    balance: body.balance ? Number(body.balance) : null,
    down_payment: body.down_payment ? Number(body.down_payment) : null,
    comfort_level: 'maybe',
    photo_urls: photoUrls,
  };
  const { data, error } = await supabaseAdmin().from('submissions').insert(payload).select('id').single();
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