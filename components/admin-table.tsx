'use client';
import { useState } from 'react';
import { Submission } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatCurrency, comfortLabel } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const STATUS_TABS = ['all', 'pending', 'live', 'sold', 'rejected'] as const;

interface Props {
  listings: Submission[];
  onUpdate: (id: string, updates: Partial<Submission>) => void;
}

export default function AdminTable({ listings, onUpdate }: Props) {
  const [tab, setTab] = useState<string>('all');
  const [detail, setDetail] = useState<Submission | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const filtered = tab === 'all' ? listings : listings.filter(l => l.status === tab);

  async function updateStatus(id: string, status: string) {
    const res = await fetch('/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      onUpdate(id, { status: status as Submission['status'] });
      toast({ title: 'Updated', description: `Listing marked ${status}` });
    }
  }

  async function saveNotes(id: string) {
    await fetch('/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, admin_notes: notes }),
    });
    onUpdate(id, { admin_notes: notes });
    toast({ title: 'Notes saved' });
  }

  function openDetail(l: Submission) {
    setDetail(l);
    setNotes(l.admin_notes ?? '');
  }

  const statusBadge = (s: string) => {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      live: 'default', pending: 'outline', sold: 'secondary', rejected: 'destructive', contacted: 'default',
    };
    return <Badge variant={map[s] ?? 'outline'}>{s}</Badge>;
  };

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {STATUS_TABS.map(t => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="mt-4 border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Left</TableHead>
              <TableHead>Comfort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(l => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.year} {l.make} {l.model}</TableCell>
                <TableCell><Badge variant="outline">{l.source}</Badge></TableCell>
                <TableCell className="text-sm">
                  {l.source === 'seller' ? <><div>{l.first_name} {l.last_name}</div><div className="text-muted-foreground">{l.phone}</div></> : '—'}
                </TableCell>
                <TableCell>{formatCurrency(l.monthly_payment)}/mo</TableCell>
                <TableCell>{l.payments_left}</TableCell>
                <TableCell className="text-xs">{comfortLabel(l.comfort_level)}</TableCell>
                <TableCell>{statusBadge(l.status)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => openDetail(l)}>Details</Button>
                    {l.status === 'pending' && <Button size="sm" onClick={() => updateStatus(l.id, 'live')}>Approve</Button>}
                    {l.status !== 'rejected' && <Button size="sm" variant="destructive" onClick={() => updateStatus(l.id, 'rejected')}>Reject</Button>}
                    {l.status !== 'sold' && l.status !== 'rejected' && <Button size="sm" variant="secondary" onClick={() => updateStatus(l.id, 'sold')}>Sold</Button>}
                    {l.status !== 'contacted' && l.status === 'live' && <Button size="sm" variant="outline" onClick={() => updateStatus(l.id, 'contacted')}>Contacted</Button>}
                    {l.status === 'rejected' && <Button size="sm" variant="outline" onClick={() => updateStatus(l.id, 'live')}>Restore</Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detail} onOpenChange={v => !v && setDetail(null)}>
        {detail && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{detail.year} {detail.make} {detail.model}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {detail.photo_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {detail.photo_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="" className="w-full aspect-square object-cover rounded-md hover:opacity-80" />
                    </a>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {detail.first_name && <><span className="text-muted-foreground">Name</span><span>{detail.first_name} {detail.last_name}</span></>}
                {detail.phone && <><span className="text-muted-foreground">Phone</span><span>{detail.phone}</span></>}
                {detail.email && <><span className="text-muted-foreground">Email</span><span>{detail.email}</span></>}
                <span className="text-muted-foreground">Lender</span><span>{detail.lender}</span>
                {detail.balance && <><span className="text-muted-foreground">Balance</span><span>{formatCurrency(detail.balance)}</span></>}
                {detail.seller_reason && <><span className="text-muted-foreground">Reason</span><span>{detail.seller_reason}</span></>}
              </div>
              <div>
                <Label>Admin Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => saveNotes(detail.id)} className="mt-1" />
                <Button size="sm" className="mt-2" onClick={() => saveNotes(detail.id)}>Save Notes</Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}