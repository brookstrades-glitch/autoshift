import SellerForm from '@/components/seller-form';

export default function SellPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-14 items-start">

        {/* ── Left panel (desktop only) ── */}
        <div className="hidden lg:block lg:col-span-2 lg:sticky lg:top-24">
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.5) saturate(0.7)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white text-2xl font-black leading-tight mb-3">
                Turn your car note<br />into an exit.
              </p>
              <p className="text-white/55 text-sm leading-relaxed">
                We review every submission and connect you with verified buyers.
                Nothing goes live without your approval.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-white text-2xl font-black">48h</div>
                  <div className="text-white/50 text-xs mt-0.5">Review time</div>
                </div>
                <div>
                  <div className="text-white text-2xl font-black">Free</div>
                  <div className="text-white/50 text-xs mt-0.5">To list</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <div className="col-span-1 lg:col-span-3">
          <h1 className="text-3xl font-bold mb-2">List Your Car Note</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Fill out the form below. Your listing won&apos;t go live until we
            review it and reach out — usually within 48 hours.
          </p>
          <SellerForm />
          <p className="text-sm text-muted-foreground mt-8 text-center">
            Already submitted?{' '}
            <a href="/status" className="text-primary hover:underline">Check your listing status</a>
          </p>
        </div>

      </div>
    </div>
  );
}
