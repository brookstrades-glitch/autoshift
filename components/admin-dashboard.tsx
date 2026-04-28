'use client';
import { useState } from 'react';
import { Submission, Inquiry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AdminTable from './admin-table';
import AdminInquiries from './admin-inquiries';
import AdminAddListing from './admin-add-listing';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

function PendingTray({ listings, onUpdate }: { listings: Submission[]; onUpdate: (id: string, updates: Partial<Submission>) => void }) {
  const { toast } = useToast();
  const pending = listings.filter(l => l.status === 'pending');
  if (pending.length === 0) return null;

  async function act(id: string, status: 'live' | 'rejected') {
    const res = await fetch('/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      onUpdate(id, { status });
      toast({ title: status === 'live' ? 'Approved — now live' : 'Rejected' });
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">
        Needs Review — {pending.length} pending
      </p>
      <div className="space-y-2">
        {pending.map(l => (
          <div key={l.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{l.year} {l.make} {l.model}</p>
              <p className="text-xs text-muted-foreground">{l.first_name} {l.last_name} · {formatCurrency(l.monthly_payment)}/mo</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={() => act(l.id, 'live')}>Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => act(l.id, 'rejected')}>Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  stats: { pending: number; live: number; sold: number; newInquiries: number };
  listings: Submission[];
  inquiries: Inquiry[];
}

export default function AdminDashboard({ stats, listings, inquiries }: Props) {
  const [allListings, setAllListings] = useState(listings);
  const [allInquiries, setAllInquiries] = useState(inquiries);
  const [addOpen, setAddOpen] = useState(false);

  function updateListing(id: string, updates: Partial<Submission>) {
    setAllListings(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }

  function onListingAdded(listing: Submission) {
    setAllListings(prev => [listing, ...prev]);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setAddOpen(true)}>+ Add Listing</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: stats.pending },
          { label: 'Live Listings', value: stats.live },
          { label: 'New Inquiries', value: stats.newInquiries },
          { label: 'Sold', value: stats.sold },
        ].map(s => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="inquiries">
            Inquiries {stats.newInquiries > 0 && <Badge className="ml-2" variant="destructive">{stats.newInquiries}</Badge>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="mt-4">
          <PendingTray listings={allListings} onUpdate={updateListing} />
          <AdminTable listings={allListings} onUpdate={updateListing} />
        </TabsContent>
        <TabsContent value="inquiries" className="mt-4">
          <AdminInquiries inquiries={allInquiries} listings={allListings} onUpdate={setAllInquiries} />
        </TabsContent>
      </Tabs>

      <AdminAddListing open={addOpen} onOpenChange={setAddOpen} onAdded={onListingAdded} />
    </div>
  );
}