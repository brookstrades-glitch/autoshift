import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { PublicListing } from '@/lib/types';
import ListingCard from '@/components/listing-card';
import BrowseFilters from '@/components/browse-filters';

export const metadata: Metadata = {
  title: 'Browse Car Note Deals',
  description: 'Browse all available car note takeover listings in Houston, TX. SUVs, trucks, sedans and more — take over payments with no traditional financing needed.',
  alternates: { canonical: 'https://autoshifthouston.com/browse' },
};

async function getListings(): Promise<PublicListing[]> {
  const { data } = await supabase
    .from('submissions')
    .select('id,created_at,year,make,model,color,vehicle_type,mileage,monthly_payment,payments_left,lender,balance,down_payment,comfort_level,status,photo_urls')
    .in('status', ['live', 'sold'])
    .order('created_at', { ascending: false });
  return (data ?? []) as PublicListing[];
}

export const revalidate = 60;

export default async function BrowsePage() {
  const listings = await getListings();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Browse Deals</h1>
      <p className="text-muted-foreground mb-8">All listings are manually verified before going live.</p>
      <BrowseFilters listings={listings} />
    </div>
  );
}