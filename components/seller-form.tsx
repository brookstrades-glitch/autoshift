'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import PhotoUpload from './photo-upload';

export default function SellerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    year: '', make: '', model: '', color: '', vehicle_type: '',
    mileage: '', monthly_payment: '', payments_left: '', lender: '', balance: '',
    comfort_level: '', seller_reason: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (photos.length === 0) { setPhotoError('At least one photo is required.'); return; }
    setPhotoError('');
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (honeypotRef.current) fd.append('website', honeypotRef.current.value);
    photos.forEach(p => fd.append('photos', p));
    await fetch('/api/submissions', { method: 'POST', body: fd });
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <Alert>
        <AlertDescription>
          Received. We will review and reach out within 48 hours. Nothing goes live until we contact you.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Honeypot */}
      <input ref={honeypotRef} name="website" type="text" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Your Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>First Name</Label><Input value={form.first_name} onChange={e => update('first_name', e.target.value)} /></div>
          <div><Label>Last Name</Label><Input value={form.last_name} onChange={e => update('last_name', e.target.value)} /></div>
        </div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Vehicle Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => update('year', e.target.value)} /></div>
          <div><Label>Make</Label><Input value={form.make} onChange={e => update('make', e.target.value)} /></div>
          <div><Label>Model</Label><Input value={form.model} onChange={e => update('model', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Color</Label><Input value={form.color} onChange={e => update('color', e.target.value)} /></div>
          <div>
            <Label>Vehicle Type</Label>
            <Select value={form.vehicle_type} onValueChange={v => update('vehicle_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SUV/Truck">SUV/Truck</SelectItem>
                <SelectItem value="Sedan/Coupe">Sedan/Coupe</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Mileage (optional)</Label><Input type="number" value={form.mileage} onChange={e => update('mileage', e.target.value)} /></div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Loan Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Monthly Payment ($)</Label><Input type="number" value={form.monthly_payment} onChange={e => update('monthly_payment', e.target.value)} /></div>
          <div><Label>Payments Left</Label><Input type="number" value={form.payments_left} onChange={e => update('payments_left', e.target.value)} /></div>
        </div>
        <div><Label>Lender</Label><Input value={form.lender} onChange={e => update('lender', e.target.value)} /></div>
        <div><Label>Remaining Balance (optional)</Label><Input type="number" value={form.balance} onChange={e => update('balance', e.target.value)} /></div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Comfort Level</h2>
        <p className="text-sm text-muted-foreground">Are you comfortable with the buyer's name being added to the title?</p>
        <RadioGroup value={form.comfort_level} onValueChange={v => update('comfort_level', v)}>
          <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="yes" /><Label htmlFor="yes">Yes — I&apos;m fine with it</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="maybe" id="maybe" /><Label htmlFor="maybe">Open to discussing it</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="no" id="no" /><Label htmlFor="no">No — payments only</Label></div>
        </RadioGroup>
        <div>
          <Label>Why are you selling? (optional)</Label>
          <Textarea value={form.seller_reason} onChange={e => update('seller_reason', e.target.value)} />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Photos</h2>
        <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
        {photoError && <p className="text-sm text-destructive">{photoError}</p>}
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
        {loading ? 'Submitting...' : 'Submit Listing'}
      </Button>
    </div>
  );
}