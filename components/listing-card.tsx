'use client';
import { useState } from 'react';
import { PublicListing } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, comfortLabel } from '@/lib/utils';
import InquireDialog from './inquire-dialog';

export default function ListingCard({ listing }: { listing: PublicListing }) {
  const [open, setOpen] = useState(false);
  const isSold = listing.status === 'sold';

  return (
    <>
      <div className={`relative ${isSold ? 'opacity-50' : ''}`}>
        {isSold && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="text-sm font-bold">SOLD</Badge>
          </div>
        )}
        <Card className="overflow-hidden h-full flex flex-col">
          {listing.photo_urls.length > 0 && (
            <div className="aspect-video relative overflow-hidden">
              <img
                src={listing.photo_urls[0]}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <div className="font-bold text-lg">{listing.year} {listing.make} {listing.model}</div>
            <div className="text-muted-foreground text-sm">{listing.color} · {listing.vehicle_type}</div>
          </CardHeader>
          <CardContent className="space-y-2 flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Monthly Payment</span>
              <span className="font-semibold">{formatCurrency(listing.monthly_payment)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Payments Left</span>
              <span>{listing.payments_left}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Lender</span>
              <span>{listing.lender}</span>
            </div>
            {listing.balance && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Balance</span>
                <span>{formatCurrency(listing.balance)}</span>
              </div>
            )}
            {listing.mileage && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Mileage</span>
                <span>{listing.mileage.toLocaleString()} mi</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs">{comfortLabel(listing.comfort_level)}</Badge>
          </CardContent>
          {!isSold && (
            <CardFooter>
              <Button className="w-full" onClick={() => setOpen(true)}>Inquire</Button>
            </CardFooter>
          )}
        </Card>
      </div>
      <InquireDialog listing={listing} open={open} onOpenChange={setOpen} />
    </>
  );
}