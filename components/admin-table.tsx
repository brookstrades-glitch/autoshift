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

const STATUS_TABS = ['all', 'pending', 'live', 'sold', 'contacted', 'archived', 'rejected'] as const;

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

  function statusBadge(s: string) {
    const styles: Record<string, string> = {
      live:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      pending:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
      sold:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
      contacted: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      archived:  'bg-muted/50 text-muted-foreground border-border',
      rejected:  'bg-destructive/15 text-destructive border-destructive/30',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[s] ?? ''}`}>
        {s}
      </span>
    );
  }

  function actions(l: Submission) {
    switch (l.status) {
      case 'pending':
        return (
          <>
            <Button size="sm" onClick={() => updateStatus(l.id, 'live')}>Approve</Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus(l.id, 'rejected')}>Reject</Button>
          </>
        );
      case 'live':
        return (
          <>
            <Button size="sm" variant="outline" onClick={() => updateStatus(l.id, 'contacted')}>Contacted</Button>
            <Button size="sm" variant="secondary" onClick={() => updateStatus(l.id, 'sold')}>Sold</Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus(l.id, 'archived')}>Archive</Button>
          </>
        );
      case 'contacted':
        return (
          <>
            <Button size="sm" variant="secondary" onClick={() => updateStatus(l.id, 'sold')}>Sold</Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus(l.id, 'archived')}>Archive</Button>
          </>
        );
      case 'sold':
        return (
          <Button size="sm" variant="destructive" onClick={() => updateStatus(l.id, 'archived')}>Archive</Button>
        );
      case 'rejected':
        return (
          <Button size="sm" variant="outline" onClick={() => updateStatus(l.id, 'pending')}>Restore</Button>
        );
      case 'archived':
        return (
          <Button size="sm" variant="outline" onClick={() => updateStatus(l.id, 'live')}>Restore</Button>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_TABS.map(t => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t}
              {t !== 'all' && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {listings.filter(l => l.status === t).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Left</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">No listings</TableCell>
              </TableRow>
            )}
            {filtered.map(l => (
              <TableRow key={l.id} className={l.status === 'archived' || l.status === 'rejected' ? 'opacity-50' : ''}>
                <TableCell className="font-medium whitespace-nowrap">
                  {l.year} {l.make} {l.model}
                  {l.source === 'admin' && <span className="ml-1.5 text-[10px] text-muted-foreground uppercase">admin</span>}
                </TableCell>
                <TableCell className="text-sm">
                  {l.source === 'seller'
                    ? <><div className="whitespace-nowrap">{l.first_name} {l.last_name}</div><div className="text-muted-foreground">{l.phone}</div></>
                    : '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(l.monthly_payment)}/mo</TableCell>
                <TableCell>{l.payments_left}</TableCell>
                <TableCell>{statusBadge(l.status)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => openDetail(l)}>Details</Button>
                    {actions(l)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detail} onOpenChange={v => !v && setDetail(null)}>
        {detail && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{detail.year} {detail.make} {detail.model}</DialogTitle>
            </DialogHeader>
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {detail.first_name && <><span className="text-muted-foreground">Name</span><span>{detail.first_name} {detail.last_name}</span></>}
                {detail.phone && <><span className="text-muted-foreground">Phone</span><span>{detail.phone}</span></>}
                {detail.email && <><span className="text-muted-foreground">Email</span><span>{detail.email}</span></>}
                <span className="text-muted-foreground">Lender</span><span>{detail.lender}</span>
                {detail.balance && <><span className="text-muted-foreground">Balance</span><span>{formatCurrency(detail.balance)}</span></>}
                {detail.mileage && <><span className="text-muted-foreground">Mileage</span><span>{detail.mileage.toLocaleString()} mi</span></>}
                {detail.seller_reason && <><span className="text-muted-foreground">Reason</span><span>{detail.seller_reason}</span></>}
              </div>
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  onBlur={() => saveNotes(detail.id)}
                />
                <Button size="sm" className="mt-2" onClick={() => saveNotes(detail.id)}>Save Notes</Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
