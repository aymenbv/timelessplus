-- Add referral_code column to orders table
ALTER TABLE public.orders 
ADD COLUMN referral_code text DEFAULT NULL;