'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { statusDisplayLabel } from '@/lib/utils';

interface StatusResult {
  id: string;
  year: number;
  make: string;
  model: string;
  created_at: string;
  status: string;
  display_status: string;
  recommended_down_payment?: number;
}

export default function StatusPage() {
  const [contact, setContact] = useState('');
  const [results, setResults] = useState<StatusResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if (!contact.trim()) return;
    setLoading(true);
    const res = await fetch('/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact }),
    });
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  const badgeVariant = (status: string) => {
    if (status === 'Live') return 'default';
    if (status === 'Sold') return 'secondary';
    if (status === 'Not Approved') return 'destructive';
    return 'outline';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-2">Check Your Listing Status</h1>
      <p className="text-muted-foreground mb-8">Enter the phone number or email you used when you submitted.</p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="contact">Phone number or email</Label>
          <Input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="e.g. 713-555-0100 or you@email.com"
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          />
        </div>
        <Button onClick={handleCheck} disabled={loading} className="w-full">
          {loading ? 'Checking...' : 'Check Status'}
        </Button>
      </div>

      {results !== null && (
        <div className="mt-8">
          {results.length === 0 ? (
            <Alert>
              <AlertDescription>
                No listing found for that contact info. Double-check or reach out to us at +1 (832) 980-7618.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {results.map((r) => (
                <div key={r.id} className="border rounded-lg p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{r.year} {r.make} {r.model}</div>
                    <div className="text-sm text-muted-foreground">
                      Submitted {new Date(r.created_at).toLocaleDateString()}
                    </div>
                    {r.recommended_down_payment != null && (r.status === 'live' || r.status === 'contacted') && (
                      <div className="text-sm mt-1 font-medium text-emerald-400">
                        Down payment: ${r.recommended_down_payment.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Badge variant={badgeVariant(r.display_status)}>{r.display_status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}