
CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  date text NOT NULL,
  title text NOT NULL DEFAULT '',
  audio text,
  audio_mime text,
  audio_duration integer,
  transcript text,
  summary text,
  action_steps jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'processing',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_consultations_owner ON public.consultations(owner_id, created_at DESC);
CREATE POLICY "Consultations: select own" ON public.consultations FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Consultations: insert own" ON public.consultations FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Consultations: update own" ON public.consultations FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Consultations: delete own" ON public.consultations FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'report',
  title text NOT NULL DEFAULT '',
  date text NOT NULL,
  file text,
  mime text,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_health_records_owner ON public.health_records(owner_id, created_at DESC);
CREATE POLICY "HealthRecords: select own" ON public.health_records FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "HealthRecords: insert own" ON public.health_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "HealthRecords: update own" ON public.health_records FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "HealthRecords: delete own" ON public.health_records FOR DELETE TO authenticated USING (auth.uid() = owner_id);
