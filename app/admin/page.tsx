import { supabaseAdmin } from '@/lib/supabase';
import AdminDashboard from '@/components/admin-dashboard';

async function getDashboardData() {
  const db = supabaseAdmin();
  const [pending, live, sold, newInquiries, allListings, allInquiries] = await Promise.all([
    db.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    db.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
    db.from('inquiries').select('*', { count: 'exact', head: true }).eq('contacted', false),
    db.from('submissions').select('*').order('created_at', { ascending: false }),
    db.from('inquiries').select('*').order('created_at', { ascending: false }),
  ]);
  return {
    stats: {
      pending: pending.count ?? 0,
      live: live.count ?? 0,
      sold: sold.count ?? 0,
      newInquiries: newInquiries.count ?? 0,
    },
    listings: allListings.data ?? [],
    inquiries: allInquiries.data ?? [],
  };
}

export const revalidate = 0;

export default async function AdminPage() {
  const data = await getDashboardData();
  return <AdminDashboard {...data} />;
}