import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FINANCING_URL } from '@/lib/financing';
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
    body: 'Basic info, employment, and residence. Takes about 5 minutes — no vehicle required.',
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

export default function FinancingPage() {
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
            <Button asChild size="default">
              <a href={FINANCING_URL} target="_blank" rel="noopener noreferrer">
                Start Application →
              </a>
            </Button>
            <Button asChild size="default" variant="outline">
              <Link href="/browse">Browse Listings</Link>
            </Button>
          </div>
        </div>
      </section>

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
              'Valid driver’s license or state ID',
              'Proof of income (recent pay stubs)',
              'Current address and residence history',
              'Employer name, phone, and time on the job',
              'Social Security number',
              'Down payment amount you have available',
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
          <Button asChild size="lg">
            <a href={FINANCING_URL} target="_blank" rel="noopener noreferrer">
              Apply Now →
            </a>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Opens in a new tab · Secured by our financing partner
          </p>
        </div>
      </section>
    </>
  );
}
