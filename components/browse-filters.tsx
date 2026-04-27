'use client';
import { useState, useMemo } from 'react';
import { PublicListing } from '@/lib/types';
import ListingCard from './listing-card';
import { Button } from '@/components/ui/button';

const FILTERS = [
  { label: 'All',             fn: () => true },
  { label: 'SUV / Truck',     fn: (l: PublicListing) => l.vehicle_type === 'SUV/Truck' },
  { label: 'Sedan / Coupe',   fn: (l: PublicListing) => l.vehicle_type === 'Sedan/Coupe' },
  { label: 'Under $400/mo',   fn: (l: PublicListing) => l.monthly_payment < 400 },
  { label: 'Title-OK',        fn: (l: PublicListing) => l.comfort_level === 'yes' },
];

export default function BrowseFilters({ listings }: { listings: PublicListing[] }) {
  const [active, setActive] = useState(0);

  const filtered = useMemo(
    () => listings.filter(FILTERS[active].fn),
    [listings, active]
  );

  return (
    <div>
      {/* Filter bar — horizontal scroll on mobile, wraps on desktop */}
      <div
        className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-2 sm:mb-6"
        role="group"
        aria-label="Filter listings"
      >
        {FILTERS.map((f, i) => {
          const count = listings.filter(f.fn).length;
          return (
            <button
              key={f.label}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={[
                'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150',
                active === i
                  ? 'bg-primary text-white shadow-[0_0_0_1px_hsl(var(--primary))]'
                  : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              ].join(' ')}
            >
              {f.label}
              <span className={[
                'text-[11px] rounded-full px-1.5 py-0.5 font-bold leading-none',
                active === i ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
              ].join(' ')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result count — always visible, below bar on mobile */}
      <p className="text-sm text-muted-foreground mb-5">
        {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium mb-1">No listings match this filter</p>
          <p className="text-sm">Try a different category above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
