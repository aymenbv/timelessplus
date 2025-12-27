-- Add color_images column to store color-to-image mapping as JSONB
ALTER TABLE public.products
ADD COLUMN color_images JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN public.products.color_images IS 'Maps color names to their image URLs: {"أسود": ["url1", "url2"], "ذهبي": ["url3"]}';