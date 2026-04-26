'use client';
import { Inquiry, Submission } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  inquiries: Inquiry[];
  listings: Submission[];
  onUpdate: (inquiries: Inquiry[]) => void;
}

export default function AdminInquiries({ inquiries, listings, onUpdate }: Props) {
  const listingMap = Object.fromEntries(listings.map(l => [l.id, l]));

  async function toggleContacted(id: string, contacted: boolean) {
    await fetch('/api/admin/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, contacted }),
    });
    onUpdate(inquiries.map(i => i.id === id ? { ...i, contacted } : i));
  }

  return (
    <div className="border rounded-lg overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Listing</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Contacted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map(i => {
            const listing = listingMap[i.listing_id];
            return (
              <TableRow key={i.id} className={!i.contacted ? 'bg-muted/30' : ''}>
                <TableCell className="font-medium">{i.buyer_name}</TableCell>
                <TableCell>{i.buyer_phone}</TableCell>
                <TableCell>{i.buyer_email}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{i.message || '—'}</TableCell>
                <TableCell className="text-sm">{listing ? `${listing.year} ${listing.make} ${listing.model}` : '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Checkbox checked={i.contacted} onCheckedChange={v => toggleContacted(i.id, !!v)} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}