'use client';
import { useState, useMemo } from 'react';
import { PublicListing } from '@/lib/types';
import ListingCard from './listing-card';
import { Button } from '@/components/ui/button';

const FILTERS = [
  { label: 'All', fn: () => true },
  { label: 'SUV/Truck', fn: (l: PublicListing) => l.vehicle_type === 'SUV/Truck' },
  { label: 'Sedan/Coupe', fn: (l: PublicListing) => l.vehicle_type === 'Sedan/Coupe' },
  { label: 'Under $400/mo', fn: (l: PublicListing) => l.monthly_payment < 400 },
  { label: 'Name-on-Title OK', fn: (l: PublicListing) => l.comfort_level === 'yes' },
];

export default function BrowseFilters({ listings }: { listings: PublicListing[] }) {
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => listings.filter(FILTERS[active].fn), [listings, active]);

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f, i) => (
          <Button key={f.label} variant={active === i ? 'default' : 'outline'} size="sm" onClick={() => setActive(i)}>
            {f.label}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No listings match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}