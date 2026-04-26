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