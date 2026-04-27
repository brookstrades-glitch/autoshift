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

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{listing.year} {listing.make} {listing.model}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <Alert role="status">
            <AlertDescription>
              Got it. We will be in touch at the number or email you provided.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-1">
            <div>
              <Label htmlFor="inq-name">Your Name</Label>
              <Input
                id="inq-name"
                value={form.buyer_name}
                onChange={e => update('buyer_name', e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <Label htmlFor="inq-phone">Phone</Label>
              <Input
                id="inq-phone"
                type="tel"
                value={form.buyer_phone}
                onChange={e => update('buyer_phone', formatPhone(e.target.value))}
                autoComplete="tel"
                inputMode="tel"
                placeholder="(555) 555-5555"
                required
              />
            </div>
            <div>
              <Label htmlFor="inq-email">Email</Label>
              <Input
                id="inq-email"
                type="email"
                value={form.buyer_email}
                onChange={e => update('buyer_email', e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="inq-message">Message <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                id="inq-message"
                value={form.message}
                onChange={e => update('message', e.target.value)}
                placeholder="Any questions about the vehicle…"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting…' : 'Submit Interest'}
            </Button>
          </form>
        )}

        <DialogFooter className="text-xs text-muted-foreground justify-center pt-2">
          +1 (706) 459-9280 · twice1021@gmail.com
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
