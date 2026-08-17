import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const listing_id = typeof body.listing_id === 'string' && UUID.test(body.listing_id) ? body.listing_id : null;

  const { error } = await supabaseAdmin()
    .from('financing_clicks')
    .insert({ listing_id, referrer: req.headers.get('referer')?.slice(0, 500) ?? null });

  if (error) {
    console.error('financing_clicks insert failed:', error.message);
    return new NextResponse(null, { status: 204 });
  }
  return new NextResponse(null, { status: 204 });
}
