-- Add is_featured column to products table
ALTER TABLE public.products 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for faster featured product queries
CREATE INDEX idx_products_is_featured ON public.products (is_featured) WHERE is_featured = true;

-- Add delete policy for orders (admins only)
CREATE POLICY "Admins can delete orders" 
ON public.orders 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));