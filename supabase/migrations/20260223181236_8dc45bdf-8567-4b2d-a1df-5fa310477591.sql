
-- Create analysis history table (no auth required - public use)
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  fabric_name TEXT,
  fabric_name_en TEXT,
  fabric_type TEXT,
  fabric_type_en TEXT,
  embellishment TEXT,
  embellishment_en TEXT,
  color TEXT,
  color_en TEXT,
  craftsmanship TEXT,
  craftsmanship_en TEXT,
  category TEXT,
  category_en TEXT,
  additional_details TEXT,
  additional_details_en TEXT,
  confidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public app, no auth)
CREATE POLICY "Anyone can insert analysis history"
ON public.analysis_history FOR INSERT
WITH CHECK (true);

-- Allow anyone to read analysis history
CREATE POLICY "Anyone can read analysis history"
ON public.analysis_history FOR SELECT
USING (true);

-- Allow anyone to delete their own (by id)
CREATE POLICY "Anyone can delete analysis history"
ON public.analysis_history FOR DELETE
USING (true);
