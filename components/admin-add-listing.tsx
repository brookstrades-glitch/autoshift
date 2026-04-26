'use client';
import { useState } from 'react';
import { Submission } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import PhotoUpload from './photo-upload';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdded: (listing: Submission) => void;
}

export default function AdminAddListing({ open, onOpenChange, onAdded }: Props) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    year: '', make: '', model: '', color: '', vehicle_type: '',
    mileage: '', monthly_payment: '', payments_left: '', lender: '', balance: '',
    comfort_level: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (photos.length === 0) { toast({ title: 'Photo required', variant: 'destructive' }); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    photos.forEach(p => fd.append('photos', p));
    const res = await fetch('/api/admin/listings', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      toast({ title: 'Listing added and live' });
      onAdded({ ...form, id: data.id, source: 'admin', status: 'live', photo_urls: [], created_at: new Date().toISOString() } as unknown as Submission);
      onOpenChange(false);
      setPhotos([]);
      setForm({ year: '', make: '', model: '', color: '', vehicle_type: '', mileage: '', monthly_payment: '', payments_left: '', lender: '', balance: '', comfort_level: '' });
    } else {
      toast({ title: 'Error saving listing', variant: 'destructive' });
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Listing</DialogTitle></DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => update('year', e.target.value)} /></div>
              <div><Label>Make</Label><Input value={form.make} onChange={e => update('make', e.target.value)} /></div>
              <div><Label>Model</Label><Input value={form.model} onChange={e => update('model', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Color</Label><Input value={form.color} onChange={e => update('color', e.target.value)} /></div>
              <div>
                <Label>Type</Label>
                <Select value={form.vehicle_type} onValueChange={v => update('vehicle_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUV/Truck">SUV/Truck</SelectItem>
                    <SelectItem value="Sedan/Coupe">Sedan/Coupe</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Mileage</Label><Input type="number" value={form.mileage} onChange={e => update('mileage', e.target.value)} /></div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Monthly Payment ($)</Label><Input type="number" value={form.monthly_payment} onChange={e => update('monthly_payment', e.target.value)} /></div>
              <div><Label>Payments Left</Label><Input type="number" value={form.payments_left} onChange={e => update('payments_left', e.target.value)} /></div>
            </div>
            <div><Label>Lender</Label><Input value={form.lender} onChange={e => update('lender', e.target.value)} /></div>
            <div><Label>Balance</Label><Input type="number" value={form.balance} onChange={e => update('balance', e.target.value)} /></div>
          </div>
          <Separator />
          <div>
            <Label>Comfort Level</Label>
            <RadioGroup value={form.comfort_level} onValueChange={v => update('comfort_level', v)} className="mt-2">
              <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="a-yes" /><Label htmlFor="a-yes">Name on Title OK</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="maybe" id="a-maybe" /><Label htmlFor="a-maybe">Open to Discuss</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="no" id="a-no" /><Label htmlFor="a-no">No Title Transfer</Label></div>
            </RadioGroup>
          </div>
          <Separator />
          <div><Label>Photos (min 1)</Label><PhotoUpload photos={photos} onPhotosChange={setPhotos} /></div>
          <Button onClick={handleSave} disabled={loading} className="w-full">{loading ? 'Saving...' : 'Add Listing — Go Live'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}