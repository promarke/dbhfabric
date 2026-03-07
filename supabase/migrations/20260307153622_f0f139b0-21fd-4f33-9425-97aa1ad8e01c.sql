
-- Drop all existing RESTRICTIVE policies on analysis_history
DROP POLICY IF EXISTS "Anyone can delete analysis history" ON public.analysis_history;
DROP POLICY IF EXISTS "Anyone can insert analysis history" ON public.analysis_history;
DROP POLICY IF EXISTS "Anyone can read analysis history" ON public.analysis_history;

-- Drop all existing RESTRICTIVE policies on fabric_corrections
DROP POLICY IF EXISTS "Anyone can delete corrections" ON public.fabric_corrections;
DROP POLICY IF EXISTS "Anyone can insert corrections" ON public.fabric_corrections;
DROP POLICY IF EXISTS "Anyone can read corrections" ON public.fabric_corrections;

-- Create PERMISSIVE policies for analysis_history
CREATE POLICY "Allow public select on analysis_history" ON public.analysis_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert on analysis_history" ON public.analysis_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on analysis_history" ON public.analysis_history FOR DELETE USING (true);
CREATE POLICY "Allow public update on analysis_history" ON public.analysis_history FOR UPDATE USING (true) WITH CHECK (true);

-- Create PERMISSIVE policies for fabric_corrections
CREATE POLICY "Allow public select on fabric_corrections" ON public.fabric_corrections FOR SELECT USING (true);
CREATE POLICY "Allow public insert on fabric_corrections" ON public.fabric_corrections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on fabric_corrections" ON public.fabric_corrections FOR DELETE USING (true);
CREATE POLICY "Allow public update on fabric_corrections" ON public.fabric_corrections FOR UPDATE USING (true) WITH CHECK (true);

-- Drop the foreign key constraint that prevents corrections without valid analysis_id
ALTER TABLE public.fabric_corrections DROP CONSTRAINT IF EXISTS fabric_corrections_analysis_id_fkey;
