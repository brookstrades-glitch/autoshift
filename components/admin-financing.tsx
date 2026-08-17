'use client';
import { FinancingClick, Submission } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Props {
  clicks: FinancingClick[];
  listings: Submission[];
}

export default function AdminFinancing({ clicks, listings }: Props) {
  const listingMap = Object.fromEntries(listings.map(l => [l.id, l]));

  const byListing = clicks.reduce<Record<string, { count: number; last: string }>>((acc, c) => {
    const key = c.listing_id ?? 'none';
    if (!acc[key]) acc[key] = { count: 0, last: c.created_at };
    acc[key].count++;
    if (c.created_at > acc[key].last) acc[key].last = c.created_at;
    return acc;
  }, {});

  const rows = Object.entries(byListing).sort((a, b) => b[1].count - a[1].count);

  if (clicks.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
        No financing applications started yet. Clicks are recorded when someone opens the
        lender&apos;s application from a listing or the financing page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Interest by vehicle</h3>
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Applications started</TableHead>
                <TableHead>Last click</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([id, agg]) => {
                const listing = listingMap[id];
                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium">
                      {listing
                        ? `${listing.year} ${listing.make} ${listing.model}`
                        : <span className="text-muted-foreground">No listing (general financing page)</span>}
                    </TableCell>
                    <TableCell>
                      {listing ? <Badge variant="outline">{listing.status}</Badge> : '—'}
                    </TableCell>
                    <TableCell className="text-right font-bold">{agg.count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(agg.last).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Recent clicks</h3>
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Listing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clicks.slice(0, 50).map(c => {
                const listing = c.listing_id ? listingMap[c.listing_id] : null;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(c.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {listing
                        ? `${listing.year} ${listing.make} ${listing.model}`
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        These are anonymous — they tell you which car someone was looking at when they opened
        the application, not who applied. Applicant details go to A2B through the lender&apos;s form.
      </p>
    </div>
  );
}
