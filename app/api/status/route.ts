import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { statusDisplayLabel } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const { contact } = await req.json();
  if (!contact) return NextResponse.json([], { status: 200 });

  const { data } = await supabaseAdmin()
    .from('submissions')
    .select('id,year,make,model,created_at,status')
    .or(`phone.eq.${contact},email.eq.${contact}`);

  const results = (data ?? []).map((row: any) => ({
    ...row,
    display_status: statusDisplayLabel(row.status),
  }));
  return NextResponse.json(results);
}