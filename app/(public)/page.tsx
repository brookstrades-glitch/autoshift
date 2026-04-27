import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PublicListing } from '@/lib/types';
import BrowseFilters from '@/components/browse-filters';

export const revalidate = 60;

async function getListings(): Promise<PublicListing[]> {
  const { data } = await supabase
    .from('submissions')
    .select('id,created_at,year,make,model,color,vehicle_type,mileage,monthly_payment,payments_left,lender,balance,comfort_level,status,photo_urls')
    .in('status', ['live', 'sold'])
    .order('created_at', { ascending: false });
  return (data ?? []) as PublicListing[];
}

export default async function HomePage() {
  const listings = await getListings();

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Subject-to disclaimer:</strong> Subject-to transactions involve taking over payments on an existing loan. The original loan remains in the seller&apos;s name. Consult a real estate or automotive attorney before proceeding. AutoShift is a listing platform only and does not provide legal or financial advice.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Car Note Takeovers in Houston</h1>
          <p className="text-muted-foreground mt-1">Take over someone&apos;s car payments — no traditional financing needed.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button asChild variant="outline" size="sm"><Link href="/sell">List My Note</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/status">Check Status</Link></Button>
        </div>
      </div>

      <BrowseFilters listings={listings} />
    </div>
  );
}
