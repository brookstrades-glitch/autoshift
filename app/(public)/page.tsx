import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { PublicListing } from '@/lib/types';
import BrowseFilters from '@/components/browse-filters';

export const metadata: Metadata = {
  title: 'Car Note Takeovers in Houston, TX',
  description: 'Browse verified car note takeover deals in Houston. Take over someone\'s car payments — no bank financing required. New listings added regularly.',
  alternates: { canonical: 'https://autoshifthouston.com' },
};

export const revalidate = 60;

async function getListings(): Promise<PublicListing[]> {
  const { data } = await supabase
    .from('submissions')
    .select('id,created_at,year,make,model,color,vehicle_type,mileage,monthly_payment,payments_left,lender,balance,down_payment,status,photo_urls')
    .in('status', ['live', 'sold'])
    .order('created_at', { ascending: false });
  return (data ?? []) as PublicListing[];
}

export default async function HomePage() {
  const listings = await getListings();
  const liveCount = listings.filter(l => l.status === 'live').length;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[52svh] flex flex-col justify-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1550095792-46c9e525f25a?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.42) saturate(0.7)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 pb-10 pt-20">
          <p className="text-[11px] uppercase tracking-[0.35em] text-primary font-semibold mb-4">
            Houston, TX
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[0.9] mb-4">
            Car Note<br />Takeovers.
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mb-7 leading-relaxed">
            Take over someone&apos;s car payments — verified deals, no traditional financing required.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="default">
              <a href="#catalog">
                Browse {liveCount > 0 ? `${liveCount} Live Deal${liveCount !== 1 ? 's' : ''}` : 'Listings'}
              </a>
            </Button>
            <Button asChild size="default" variant="outline">
              <Link href="/sell">List My Note →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Catalog ──────────────────────────────────────────── */}
      <section id="catalog" className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
          <h2 className="text-2xl font-bold">Available Now</h2>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground text-xs">
            <Link href="/sell">+ List your note</Link>
          </Button>
        </div>

        <BrowseFilters listings={listings} />
      </section>
    </>
  );
}
