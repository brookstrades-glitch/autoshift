'use client';
import { useState } from 'react';
import { PublicListing } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, comfortLabel } from '@/lib/utils';
import InquireDialog from './inquire-dialog';

export default function ListingCard({ listing }: { listing: PublicListing }) {
  const [open, setOpen] = useState(false);
  const isSold = listing.status === 'sold';

  return (
    <>
      <div className={`group relative ${isSold ? 'opacity-50' : ''}`}>
        {isSold && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="secondary" className="text-xs font-bold tracking-wider uppercase">Sold</Badge>
          </div>
        )}

        <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">

          {/* Photo */}
          {listing.photo_urls.length > 0 ? (
            <div className="aspect-[16/10] relative overflow-hidden bg-muted">
              <img
                src={listing.photo_urls[0]}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-muted flex items-center justify-center">
              <span className="text-muted-foreground/30 text-xs uppercase tracking-widest">No photo</span>
            </div>
          )}

          <CardContent className="flex-1 p-4 space-y-3">
            {/* Title + type */}
            <div>
              <div className="font-bold text-base leading-tight">
                {listing.year} {listing.make} {listing.model}
              </div>
              <div className="text-muted-foreground text-xs mt-0.5">
                {listing.color} · {listing.vehicle_type}
              </div>
            </div>

            {/* Monthly payment — hero stat */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-primary tracking-tight">
                {formatCurrency(listing.monthly_payment)}
              </span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm pt-1 border-t border-border">
              <span className="text-muted-foreground text-xs">Payments left</span>
              <span className="text-xs font-medium text-right">{listing.payments_left}</span>

              <span className="text-muted-foreground text-xs">Lender</span>
              <span className="text-xs font-medium text-right truncate">{listing.lender}</span>

              {listing.balance != null && (
                <>
                  <span className="text-muted-foreground text-xs">Balance</span>
                  <span className="text-xs font-medium text-right">{formatCurrency(listing.balance)}</span>
                </>
              )}
              {listing.mileage != null && (
                <>
                  <span className="text-muted-foreground text-xs">Mileage</span>
                  <span className="text-xs font-medium text-right">{listing.mileage.toLocaleString()} mi</span>
                </>
              )}
            </div>

            <Badge variant="outline" className="text-[11px] px-2 py-0.5">{comfortLabel(listing.comfort_level)}</Badge>
          </CardContent>

          {!isSold && (
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" onClick={() => setOpen(true)}>
                Inquire
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <InquireDialog listing={listing} open={open} onOpenChange={setOpen} />
    </>
  );
}
