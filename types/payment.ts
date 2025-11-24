// types/payment.ts

export type PaymentMethod = 'transfer_bank' | 'e_wallet' | 'cod';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  payment_proof_url: string | null;
  status: PaymentStatus;
  created_at: string;
  verified_at: string | null;
}