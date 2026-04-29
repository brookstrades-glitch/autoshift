import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { statusDisplayLabel } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const { contact } = await req.json();
  if (!contact || typeof contact !== 'string') return NextResponse.json([], { status: 200 });

  const db = supabaseAdmin();
  const [byPhone, byEmail] = await Promise.all([
    db.from('submissions').select('id,year,make,model,created_at,status').eq('phone', contact),
    db.from('submissions').select('id,year,make,model,created_at,status').eq('email', contact),
  ]);

  const seen = new Set<string>();
  const rows: any[] = [];
  for (const row of [...(byPhone.data ?? []), ...(byEmail.data ?? [])]) {
    if (!seen.has(row.id)) { seen.add(row.id); rows.push(row); }
  }

  return NextResponse.json(rows.map(row => ({ ...row, display_status: statusDisplayLabel(row.status) })));
}
