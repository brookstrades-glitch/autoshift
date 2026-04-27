import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Car className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-black text-base tracking-tight">AutoShift</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
            <Link href="/browse">Browse</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sell">List My Note</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
