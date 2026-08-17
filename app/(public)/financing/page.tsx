import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { vehicleFields, vehicleComment } from '@/lib/financing';
import { supabase } from '@/lib/supabase';
import { PublicListing } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import FinancingCta from '@/components/financing-cta';
import CopyLine from '@/components/copy-line';
import { ShieldCheck, Clock, FileText, CircleDollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Apply for Auto Financing in Houston',
  description: 'Apply for auto financing in Houston through our lending partner. Quick online application, all credit types considered, no obligation.',
  alternates: { canonical: 'https://autoshifthouston.com/financing' },
};

const steps = [
  {
    icon: FileText,
    title: 'Fill out the application',
    body: 'Personal, residence, and employment details. Around 10 minutes — you can apply before picking a car.',
  },
  {
    icon: Clock,
    title: 'Get reviewed',
    body: 'Our lending partner reviews your application and follows up directly with your options.',
  },
  {
    icon: CircleDollarSign,
    title: 'Shop with a budget',
    body: 'Once you know what you qualify for, we can match you with the right listing.',
  },
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getListing(id?: string): Promise<PublicListing | null> {
  if (!id || !UUID.test(id)) return null;
  const { data } = await supabase
    .from('submissions')
    .select('id,created_at,year,make,model,color,vehicle_type,mileage,monthly_payment,payments_left,lender,balance,down_payment,status,photo_urls')
    .eq('id', id)
    .eq('status', 'live')
    .maybeSingle();
  return (data as PublicListing) ?? null;
}

export default async function FinancingPage({
  searchParams,
}: {
  searchParams: { listing?: string };
}) {
  const listing = await getListing(searchParams.listing);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[46svh] flex flex-col justify-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.4) saturate(0.7)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 pb-10 pt-20">
          <p className="text-[11px] uppercase tracking-[0.35em] text-primary font-semibold mb-4">
            Financing Partner
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[0.9] mb-4">
            Apply for<br />Financing.
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mb-7 leading-relaxed">
            Get approved through our lending partner before you pick a car. All
            credit types considered — applying costs nothing and doesn&apos;t
            commit you to anything.
          </p>
          <div className="flex flex-wrap gap-3">
            <FinancingCta listingId={listing?.id}>Start Application →</FinancingCta>
            <Button asChild size="default" variant="outline">
              <Link href="/browse">Browse Listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Selected vehicle ─────────────────────────────────── */}
      {listing && (
        <section className="container mx-auto px-4 sm:px-6 pt-8">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-3">
              Applying for
            </p>
            <div className="flex items-center gap-4">
              {listing.photo_urls.length > 0 && (
                <img
                  src={listing.photo_urls[0]}
                  alt={`${listing.year} ${listing.make} ${listing.model}`}
                  className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="font-bold text-base sm:text-lg leading-tight truncate">
                  {listing.year} {listing.make} {listing.model}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {listing.down_payment != null
                    ? `${formatCurrency(listing.down_payment)} down · ${formatCurrency(listing.monthly_payment)}/mo`
                    : `${formatCurrency(listing.monthly_payment)}/mo`}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-5 mb-3 leading-relaxed">
              The application has a <strong className="text-foreground font-semibold">Vehicle
              Information</strong> section. Enter these exact values so your approval comes back
              matched to this car:
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm rounded-lg bg-background/40 p-3 max-w-sm">
              {vehicleFields(listing).map(f => (
                <div key={f.label} className="contents">
                  <dt className="text-muted-foreground text-xs">{f.label}</dt>
                  <dd className="font-medium text-right text-xs">{f.value}</dd>
                </div>
              ))}
              {listing.down_payment != null && (
                <div className="contents">
                  <dt className="text-muted-foreground text-xs">Down Payment Amount</dt>
                  <dd className="font-medium text-right text-xs">{formatCurrency(listing.down_payment)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-3">
              <CopyLine text={vehicleComment(listing)} />
              <span className="text-xs text-muted-foreground ml-2">
                for the Additional Comments box
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  Step {i + 1}
                </span>
              </div>
              <div className="font-bold text-base mb-1.5">{step.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you'll need ─────────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-5">What you&apos;ll need</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              'Driver’s license number, state, and expiration',
              'Social Security number and date of birth',
              'Address, rent or mortgage payment, and time at residence',
              'Prior address if you’ve been there under 5 years',
              'Employer name, address, phone, and time on the job',
              'Pay frequency, pay amount, and any other income',
              'Down payment amount you have available',
              'Co-borrower’s details, if you’re applying with one',
            ].map(item => (
              <li key={item} className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 pb-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2">Ready to get started?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            The application is handled securely by our lending partner. You
            don&apos;t need to choose a vehicle first.
          </p>
          <FinancingCta listingId={listing?.id} size="lg">Apply Now →</FinancingCta>
          <p className="text-xs text-muted-foreground mt-4">
            Opens in a new tab · Secured by our financing partner
          </p>
        </div>
      </section>
    </>
  );
}
