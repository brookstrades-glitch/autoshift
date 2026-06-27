'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PhotoUpload, { type UploadStatus } from './photo-upload';

export default function SellerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingStep, setSavingStep] = useState<'idle' | 'finalizing' | 'saving'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [offline, setOffline] = useState(false);
  const [disableCleanup, setDisableCleanup] = useState(false);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState('');

  // Photo upload state — populated by PhotoUpload via onStatusChange
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const uploadStatusRef = useRef<UploadStatus>('idle');
  const photoUrlsRef = useRef<string[]>([]);
  const waitResolverRef = useRef<(() => void) | null>(null);

  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline  = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  const handleUploadStatusChange = useCallback((status: UploadStatus, urls: string[]) => {
    uploadStatusRef.current = status;
    photoUrlsRef.current = urls;
    setUploadStatus(status);
    setPhotoUrls(urls);
    // Unblock a submit handler waiting for in-flight uploads to settle
    if (waitResolverRef.current && (status === 'done' || status === 'partial_error')) {
      waitResolverRef.current();
      waitResolverRef.current = null;
    }
  }, []);

  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    vin: '', year: '', make: '', model: '', color: '', vehicle_type: '',
    mileage: '', monthly_payment: '', payments_left: '', lender: '', balance: '',
    seller_reason: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function lookupVin(vin: string) {
    setVinError('');
    setVinLoading(true);
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
      const data = await res.json();
      const r = data.Results?.[0];
      if (!r || r.ErrorCode !== '0') {
        setVinError('VIN not found. Check the number and try again.');
      } else {
        const toTitle = (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        if (r.ModelYear) update('year', r.ModelYear);
        if (r.Make) update('make', toTitle(r.Make));
        if (r.Model) update('model', toTitle(r.Model));
      }
    } catch {
      setVinError('Lookup failed. Fill in vehicle details manually.');
    }
    setVinLoading(false);
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
    setSubmitError('');
    setPhotoError('');

    if (uploadStatusRef.current === 'idle') {
      setPhotoError('At least one photo is required.');
      return;
    }

    if (!navigator.onLine) {
      setSubmitError('No internet connection. Please check your connection and try again.');
      return;
    }

    setLoading(true);

    try {
      // If photos are still uploading, wait for them to settle
      if (uploadStatusRef.current === 'in_progress') {
        setSavingStep('finalizing');
        await new Promise<void>(resolve => { waitResolverRef.current = resolve; });
      }

      if (uploadStatusRef.current === 'partial_error') {
        setSubmitError('Some photos failed to upload — use the retry buttons above, then try again.');
        return;
      }

      const urls = photoUrlsRef.current;
      if (urls.length === 0) {
        setPhotoError('At least one photo is required.');
        return;
      }

      setSavingStep('saving');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);

      let res: Response;
      try {
        res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            honeypot: honeypotRef.current?.value ?? '',
            photo_urls: urls,
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

      setDisableCleanup(true);
      setSubmitted(true);
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      setSubmitError(isAbort
        ? 'Request timed out — please check your connection and try again.'
        : 'Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
      setSavingStep('idle');
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
        <div>
          <Label htmlFor="vin">VIN <span className="text-muted-foreground font-normal">(optional — auto-fills year, make &amp; model)</span></Label>
          <div className="flex gap-2">
            <Input
              id="vin"
              value={form.vin}
              onChange={e => { update('vin', e.target.value.toUpperCase()); setVinError(''); }}
              placeholder="1HGCM82633A004352"
              maxLength={17}
              className="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.vin.length !== 17 || vinLoading}
              onClick={() => lookupVin(form.vin)}
              className="shrink-0"
            >
              {vinLoading ? 'Looking up…' : 'Look up'}
            </Button>
          </div>
          {vinError && <p className="text-xs text-destructive mt-1">{vinError}</p>}
        </div>
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
        <PhotoUpload
          max={8}
          onStatusChange={handleUploadStatusChange}
          disableCleanup={disableCleanup}
        />
        {photoError && (
          <p role="alert" className="text-sm text-destructive mt-1">{photoError}</p>
        )}
      </div>

      {offline && (
        <p role="status" className="text-sm text-amber-400 text-center px-1">
          You appear to be offline — check your connection before submitting.
        </p>
      )}

      {submitError && (
        <p role="alert" className="text-sm text-destructive text-center px-1">{submitError}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {savingStep === 'finalizing' ? 'Finalizing your photos…' :
         savingStep === 'saving'     ? 'Saving…' :
         'Submit Listing'}
      </Button>
    </form>
  );
}
