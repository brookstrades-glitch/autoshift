'use client';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PhotoUpload from './photo-upload';

export default function SellerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const [uploadProgress, setUploadProgress] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    year: '', make: '', model: '', color: '', vehicle_type: '',
    mileage: '', monthly_payment: '', payments_left: '', lender: '', balance: '',
    seller_reason: '',
  });

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

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1920;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => resolve(blob ?? file), 'image/jpeg', 0.85);
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (photos.length === 0) { setPhotoError('At least one photo is required.'); return; }
    setPhotoError('');
    setSubmitError('');
    setLoading(true);

    try {
      setUploadStep('uploading');
      const photoUrls: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${photos.length}…`);
        const compressed = await compressImage(photos[i]);
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

        const { error } = await supabase.storage
          .from('vehicle-photos')
          .upload(filename, compressed, { contentType: 'image/jpeg' });

        if (error) {
          setSubmitError(`Photo ${i + 1} upload failed: ${error.message}`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('vehicle-photos')
          .getPublicUrl(filename);

        photoUrls.push(urlData.publicUrl);
      }

      // Step 2: send form fields + URLs as JSON with a 30-second timeout.
      setUploadStep('saving');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);

      let res: Response;
      try {
        res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            honeypot: honeypotRef.current?.value ?? '',
            photo_urls: photoUrls,
            ...form,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      const body = await res.json();
      if (!res.ok) {
        setSubmitError(body.error ?? `Submission failed (${res.status}). Please try again.`);
        return;
      }
      setSubmitted(true);
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      setSubmitError(isAbort
        ? 'Request timed out — please check your connection and try again.'
        : 'Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
      setUploadStep('idle');
      setUploadProgress('');
    }
  }

  if (submitted) {
    return (
      <Alert role="status">
        <AlertDescription>
          Received. We will review and reach out within 48 hours. Nothing goes live until we contact you.
        </AlertDescription>
      </Alert>
    );
  }

  const section = "rounded-xl border border-border bg-card p-6 space-y-5";
  const heading = "text-sm font-semibold uppercase tracking-widest text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="List your car note" className="space-y-4">
      {/* Honeypot — hidden from real users and assistive tech */}
      <input ref={honeypotRef} name="website" type="text" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <p className="text-xs text-muted-foreground">
        Fields marked <span aria-hidden="true" className="text-destructive font-semibold">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      {/* ── Your Info ── */}
      <div className={section}>
        <h2 className={heading} id="section-your-info">Your Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="first_name"
              value={form.first_name}
              onChange={e => update('first_name', e.target.value)}
              autoComplete="given-name"
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="last_name"
              value={form.last_name}
              onChange={e => update('last_name', e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Phone <span aria-hidden="true" className="text-destructive">*</span></Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={e => update('phone', formatPhone(e.target.value))}
            autoComplete="tel"
            inputMode="tel"
            placeholder="(555) 555-5555"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email <span aria-hidden="true" className="text-destructive">*</span></Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      {/* ── Vehicle Details ── */}
      <div className={section}>
        <h2 className={heading} id="section-vehicle">Vehicle Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="year">Year <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="year"
              value={form.year}
              onChange={e => update('year', e.target.value)}
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              placeholder="2022"
              required
            />
          </div>
          <div>
            <Label htmlFor="make">Make <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="make"
              value={form.make}
              onChange={e => update('make', e.target.value)}
              placeholder="Toyota"
              required
            />
          </div>
          <div>
            <Label htmlFor="model">Model <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="model"
              value={form.model}
              onChange={e => update('model', e.target.value)}
              placeholder="Camry"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="color">Color <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="color"
              value={form.color}
              onChange={e => update('color', e.target.value)}
              placeholder="Black"
              required
            />
          </div>
          <div>
            <Label htmlFor="vehicle_type">Vehicle Type <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Select value={form.vehicle_type} onValueChange={v => update('vehicle_type', v)} required>
              <SelectTrigger id="vehicle_type" aria-required="true">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUV/Truck">SUV / Truck</SelectItem>
                <SelectItem value="Sedan/Coupe">Sedan / Coupe</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="mileage">Mileage <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            id="mileage"
            value={form.mileage}
            onChange={e => update('mileage', e.target.value)}
            inputMode="numeric"
            placeholder="45,000"
          />
        </div>
      </div>

      {/* ── Loan Details ── */}
      <div className={section}>
        <h2 className={heading} id="section-loan">Loan Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthly_payment">Monthly Payment ($) <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="monthly_payment"
              value={form.monthly_payment}
              onChange={e => update('monthly_payment', e.target.value)}
              inputMode="numeric"
              placeholder="450"
              required
            />
          </div>
          <div>
            <Label htmlFor="payments_left">Payments Left <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="payments_left"
              value={form.payments_left}
              onChange={e => update('payments_left', e.target.value)}
              inputMode="numeric"
              placeholder="36"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="lender">Lender <span aria-hidden="true" className="text-destructive">*</span></Label>
          <Input
            id="lender"
            value={form.lender}
            onChange={e => update('lender', e.target.value)}
            placeholder="Capital One, Chase, etc."
            required
          />
        </div>
        <div>
          <Label htmlFor="balance">Remaining Balance ($) <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            id="balance"
            value={form.balance}
            onChange={e => update('balance', e.target.value)}
            inputMode="numeric"
            placeholder="18,000"
          />
        </div>
      </div>

      {/* ── Additional Info ── */}
      <div className={section}>
        <h2 className={heading}>Additional Info</h2>
        <div>
          <Label htmlFor="seller_reason">Why are you selling? <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            id="seller_reason"
            value={form.seller_reason}
            onChange={e => update('seller_reason', e.target.value)}
            placeholder="Moving, upgraded, financial change…"
          />
        </div>
      </div>

      {/* ── Photos ── */}
      <div className={section}>
        <h2 className={heading} id="section-photos">Photos</h2>
        <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
        {photoError && (
          <p role="alert" className="text-sm text-destructive mt-1">{photoError}</p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive text-center px-1">{submitError}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {uploadStep === 'uploading' ? (uploadProgress || 'Uploading…') :
         uploadStep === 'saving'   ? 'Saving…' :
         'Submit Listing'}
      </Button>
    </form>
  );
}
