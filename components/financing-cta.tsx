'use client';
import { Button } from '@/components/ui/button';
import { FINANCING_URL } from '@/lib/financing';

export default function FinancingCta({
  listingId,
  children,
  size,
  variant,
  className,
}: {
  listingId?: string;
  children: React.ReactNode;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}) {
  function log() {
    navigator.sendBeacon?.(
      '/api/financing-clicks',
      new Blob([JSON.stringify({ listing_id: listingId ?? null })], { type: 'application/json' })
    );
  }

  return (
    <Button asChild size={size} variant={variant} className={className}>
      <a href={FINANCING_URL} target="_blank" rel="noopener noreferrer" onClick={log}>
        {children}
      </a>
    </Button>
  );
}
