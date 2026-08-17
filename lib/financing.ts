import { PublicListing } from './types';

export const FINANCING_URL = 'https://secure.carsforsale.com/ssfinance.aspx?jesxel=733994';

export function financingHref(listingId?: string) {
  return listingId ? `/financing?listing=${listingId}` : '/financing';
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

export function vehicleFields(listing: PublicListing) {
  return [
    { label: 'Vehicle Make', value: clean(listing.make) },
    { label: 'Vehicle Model', value: clean(listing.model) },
    { label: 'Vehicle Year', value: String(listing.year) },
    ...(listing.mileage != null
      ? [{ label: 'Vehicle Mileage', value: listing.mileage.toLocaleString() }]
      : []),
  ];
}

export function vehicleComment(listing: PublicListing) {
  const name = clean(`${listing.year} ${listing.make} ${listing.model}`);
  return `${name} — AutoShift listing #${listing.id.slice(0, 8)}`;
}
