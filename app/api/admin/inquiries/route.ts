import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(req: NextRequest) {
  const { id, contacted } = await req.json();
  const { data, error } = await supabaseAdmin()
    .from('inquiries').update({ contacted }).eq('id', id).select('id,contacted').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}