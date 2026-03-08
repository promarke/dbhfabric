
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_price NUMERIC(10,2),
  description TEXT DEFAULT '',
  fabric_type TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  sizes TEXT[] NOT NULL DEFAULT ARRAY['52"','54"','56"','58"','60"']::TEXT[],
  colors TEXT[] NOT NULL DEFAULT ARRAY['Black']::TEXT[],
  featured BOOLEAN NOT NULL DEFAULT false,
  analysis_id UUID REFERENCES public.analysis_history(id) ON DELETE SET NULL
);

CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 5,
  UNIQUE(product_id, size, color)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can select products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Anyone can select product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert product_variants" ON public.product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product_variants" ON public.product_variants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete product_variants" ON public.product_variants FOR DELETE USING (true);
