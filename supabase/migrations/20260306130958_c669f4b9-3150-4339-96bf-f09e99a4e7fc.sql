CREATE TABLE public.fabric_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES public.analysis_history(id) ON DELETE CASCADE NOT NULL,
  original_fabric text NOT NULL,
  corrected_fabric text NOT NULL,
  original_category text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fabric_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert corrections" ON public.fabric_corrections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read corrections" ON public.fabric_corrections FOR SELECT USING (true);
CREATE POLICY "Anyone can delete corrections" ON public.fabric_corrections FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.fabric_corrections;