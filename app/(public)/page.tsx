import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Search, FileText, Handshake } from 'lucide-react';
import { supabase } from '@/lib/supabase';

async function getLiveCount() {
  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live');
  return count ?? 0;
}

export default async function HomePage() {
  const liveCount = await getLiveCount();

  return (
    <div className="container mx-auto px-4 py-12">
      <Alert variant="destructive" className="mb-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Subject-to disclaimer:</strong> Subject-to transactions involve taking over payments on an existing loan. The original loan remains in the seller&apos;s name. Consult a real estate or automotive attorney before proceeding. AutoShift is a listing platform only and does not provide legal or financial advice.
        </AlertDescription>
      </Alert>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Car Note Takeovers in Houston</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Browse verified subject-to deals — take over someone&apos;s car payments and get into a vehicle without traditional financing.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg"><Link href="/browse">Browse Deals</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/sell">List My Note</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-center">
        <div className="p-6 rounded-lg border">
          <div className="text-3xl font-bold">{liveCount}</div>
          <div className="text-muted-foreground mt-1">Active Listings</div>
        </div>
        <div className="p-6 rounded-lg border">
          <div className="text-3xl font-bold">100%</div>
          <div className="text-muted-foreground mt-1">Manually Verified</div>
        </div>
        <div className="p-6 rounded-lg border">
          <div className="text-3xl font-bold">Free</div>
          <div className="text-muted-foreground mt-1">To Browse</div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Browse Deals</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">Find a car with payments you can take over. Filter by type, monthly payment, and comfort level.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Submit Interest</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">Click &ldquo;Inquire&rdquo; on any listing. Leave your name, phone, and email. That&apos;s it.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5" /> We Connect You</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">We review your inquiry and reach out directly to introduce you to the seller.</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}