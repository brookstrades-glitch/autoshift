import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { listing_id, buyer_name, buyer_phone, buyer_email, message } = body;
  if (!listing_id || !buyer_name || !buyer_phone || !buyer_email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin()
    .from('inquiries')
    .insert({ listing_id, buyer_name, buyer_phone, buyer_email, message })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}