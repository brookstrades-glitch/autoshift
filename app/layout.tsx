import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  metadataBase: new URL('https://autoshifthouston.com'),
  title: {
    default: 'AutoShift Houston | Car Note Takeovers',
    template: '%s | AutoShift Houston',
  },
  description:
    'Find car note takeover deals in Houston, TX. Take over someone\'s car payments — no traditional financing required. Browse verified listings or list your own.',
  keywords: ['car note takeover', 'car note takeovers houston', 'assume car payments houston', 'subject to car deals', 'take over car payments houston', 'houston car deals'],
  openGraph: {
    type: 'website',
    siteName: 'AutoShift Houston',
    locale: 'en_US',
    url: 'https://autoshifthouston.com',
    title: 'AutoShift Houston | Car Note Takeovers',
    description:
      'Find car note takeover deals in Houston, TX. Take over someone\'s car payments — no traditional financing required.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoShift Houston | Car Note Takeovers',
    description:
      'Find car note takeover deals in Houston, TX. Take over someone\'s car payments — no traditional financing required.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://autoshifthouston.com' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
