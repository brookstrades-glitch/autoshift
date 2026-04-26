import SellerForm from '@/components/seller-form';

export default function SellPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">List Your Car Note</h1>
      <p className="text-muted-foreground mb-8">
        Fill out the form below. Your listing won&apos;t go live until we review it and reach out to you — usually within 48 hours.
      </p>
      <SellerForm />
      <p className="text-sm text-muted-foreground mt-6 text-center">
        Already submitted?{' '}
        <a href="/status" className="underline">Check your listing status</a>
      </p>
    </div>
  );
}