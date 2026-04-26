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

export function statusDisplayLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Received', live: 'Live', contacted: 'Live', sold: 'Sold', rejected: 'Not Approved',
  };
  return map[status] ?? status;
}