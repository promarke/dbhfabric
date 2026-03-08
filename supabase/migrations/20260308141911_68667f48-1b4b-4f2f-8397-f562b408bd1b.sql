-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- analysis_history
DROP POLICY IF EXISTS "Allow public select on analysis_history" ON public.analysis_history;
DROP POLICY IF EXISTS "Allow public insert on analysis_history" ON public.analysis_history;
DROP POLICY IF EXISTS "Allow public update on analysis_history" ON public.analysis_history;
DROP POLICY IF EXISTS "Allow public delete on analysis_history" ON public.analysis_history;

CREATE POLICY "Anyone can select analysis_history" ON public.analysis_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analysis_history" ON public.analysis_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update analysis_history" ON public.analysis_history FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete analysis_history" ON public.analysis_history FOR DELETE USING (true);

-- fabric_corrections
DROP POLICY IF EXISTS "Allow public select on fabric_corrections" ON public.fabric_corrections;
DROP POLICY IF EXISTS "Allow public insert on fabric_corrections" ON public.fabric_corrections;
DROP POLICY IF EXISTS "Allow public update on fabric_corrections" ON public.fabric_corrections;
DROP POLICY IF EXISTS "Allow public delete on fabric_corrections" ON public.fabric_corrections;

CREATE POLICY "Anyone can select fabric_corrections" ON public.fabric_corrections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert fabric_corrections" ON public.fabric_corrections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update fabric_corrections" ON public.fabric_corrections FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete fabric_corrections" ON public.fabric_corrections FOR DELETE USING (true);