import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export function comfortLabel(level: string): string {
  const map: Record<string, string> = { yes: 'Name on Title OK', maybe: 'Open to Discuss', no: 'No Title Transfer' };
  return map[level] ?? level;
}

export function calcRecommendedDownPayment(balance: number | null | undefined): number | null {
  if (!balance || balance <= 0) return null;
  if (balance < 15000) return 2000;
  if (balance < 25000) return 3000;
  if (balance < 40000) return 4500;
  return 5000;
}

export function statusDisplayLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Received', live: 'Live', contacted: 'Live', sold: 'Sold', rejected: 'Not Approved',
  };
  return map[status] ?? status;
}