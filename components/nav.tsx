import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Car className="h-5 w-5" />
          AutoShift
        </Link>
        <nav className="flex items-center gap-4">
          <Button asChild variant="ghost"><Link href="/browse">Browse</Link></Button>
          <Button asChild><Link href="/sell">List My Note</Link></Button>
        </nav>
      </div>
    </header>
  );
}