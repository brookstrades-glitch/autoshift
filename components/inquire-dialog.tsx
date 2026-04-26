'use client';
import { useState } from 'react';
import { PublicListing } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  listing: PublicListing;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function InquireDialog({ listing, open, onOpenChange }: Props) {
  const [form, setForm] = useState({ buyer_name: '', buyer_phone: '', buyer_email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.buyer_name || !form.buyer_phone || !form.buyer_email) return;
    setLoading(true);
    await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listing.id, ...form }),
    });
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{listing.year} {listing.make} {listing.model}</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <Alert>
            <AlertDescription>
              Got it. We will be in touch at the number or email you provided.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input value={form.buyer_name} onChange={e => update('buyer_name', e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.buyer_phone} onChange={e => update('buyer_phone', e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.buyer_email} onChange={e => update('buyer_email', e.target.value)} />
            </div>
            <div>
              <Label>Message (optional)</Label>
              <Textarea value={form.message} onChange={e => update('message', e.target.value)} />
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Interest'}
            </Button>
          </div>
        )}
        <DialogFooter className="text-xs text-muted-foreground justify-center">
          +1 (706) 459-9280 | twice1021@gmail.com
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}