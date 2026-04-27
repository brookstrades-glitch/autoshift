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
  const liveCount = listings.filter(l => l.status === 'live').length;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[88svh] flex flex-col justify-end overflow-hidden">
        {/* Background video — autoplay, muted, looping */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.55) saturate(0.65)' }}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark scrim */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />
        {/* Gradient: strong at bottom (page color), dissolves upward */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        {/* Left edge vignette for text pop on wide screens */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 pb-14 pt-24">
          <p className="text-[11px] uppercase tracking-[0.35em] text-primary font-semibold mb-5">
            Houston, TX
          </p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.88] mb-6">
            Car Note<br />Takeovers.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xs sm:max-w-sm mb-10 leading-relaxed">
            Take over someone&apos;s car payments — verified deals,
            no traditional financing required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="text-base">
              <a href="#catalog">
                Browse {liveCount > 0 ? `${liveCount} Live Deal${liveCount !== 1 ? 's' : ''}` : 'Listings'}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/sell">List My Note →</Link>
            </Button>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="relative z-10 flex justify-center py-6">
          <div className="w-px h-10 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
        </div>
      </section>

      {/* ── Catalog ──────────────────────────────────────────── */}
      <section id="catalog" className="container mx-auto px-4 sm:px-6 py-12">
        <Alert variant="destructive" className="mb-10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Subject-to disclaimer:</strong> These transactions involve taking over payments on an existing loan. The original loan stays in the seller&apos;s name. Consult an attorney before proceeding. AutoShift is a listing platform only — we do not provide legal or financial advice.
          </AlertDescription>
        </Alert>

        <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
          <h2 className="text-2xl font-bold">Available Now</h2>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground text-xs">
              <Link href="/sell">+ List your note</Link>
            </Button>
          </div>
        </div>

        <BrowseFilters listings={listings} />
      </section>
    </>
  );
}
