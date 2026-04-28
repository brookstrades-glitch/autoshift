export type SubmissionStatus = 'pending' | 'live' | 'sold' | 'rejected' | 'contacted' | 'archived';
export type SubmissionSource = 'seller' | 'admin';
export type ComfortLevel = 'yes' | 'maybe' | 'no';
export type VehicleType = 'SUV/Truck' | 'Sedan/Coupe' | 'Van' | 'Other';

export interface Submission {
  id: string;
  created_at: string;
  source: SubmissionSource;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  year: number;
  make: string;
  model: string;
  color?: string;
  vehicle_type: VehicleType;
  mileage?: number;
  monthly_payment: number;
  payments_left: number;
  lender: string;
  balance?: number;
  down_payment?: number;
  comfort_level: ComfortLevel;
  seller_reason?: string;
  status: SubmissionStatus;
  photo_urls: string[];
  admin_notes?: string;
}

export interface PublicListing {
  id: string;
  created_at: string;
  year: number;
  make: string;
  model: string;
  color?: string;
  vehicle_type: VehicleType;
  mileage?: number;
  monthly_payment: number;
  payments_left: number;
  lender: string;
  balance?: number;
  down_payment?: number;
  status: 'live' | 'sold';
  photo_urls: string[];
}

export interface Inquiry {
  id: string;
  created_at: string;
  listing_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  message?: string;
  contacted: boolean;
}