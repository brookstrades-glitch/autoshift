import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check Listing Status',
  description: 'Check the status of your AutoShift Houston car note listing.',
  robots: { index: false, follow: false },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
