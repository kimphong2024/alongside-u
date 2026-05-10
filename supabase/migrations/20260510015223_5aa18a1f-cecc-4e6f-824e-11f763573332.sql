
CREATE TABLE public.moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  date text NOT NULL,
  title text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  photo text,
  video text,
  audio text,
  audio_duration integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_moments_owner ON public.moments(owner_id, created_at DESC);
CREATE POLICY "Moments: select own" ON public.moments FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Moments: insert own" ON public.moments FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Moments: update own" ON public.moments FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Moments: delete own" ON public.moments FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.bucket_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Personal',
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bucket_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bucket_owner ON public.bucket_items(owner_id, created_at);
CREATE POLICY "Bucket: select own" ON public.bucket_items FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Bucket: insert own" ON public.bucket_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Bucket: update own" ON public.bucket_items FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Bucket: delete own" ON public.bucket_items FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  date text NOT NULL,
  mood text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_checkins_owner ON public.check_ins(owner_id, created_at);
CREATE POLICY "CheckIns: select own" ON public.check_ins FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "CheckIns: insert own" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "CheckIns: update own" ON public.check_ins FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "CheckIns: delete own" ON public.check_ins FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.checked_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  item_key text NOT NULL,
  checked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, item_key)
);
ALTER TABLE public.checked_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_checked_owner ON public.checked_items(owner_id);
CREATE POLICY "Checked: select own" ON public.checked_items FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Checked: insert own" ON public.checked_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Checked: update own" ON public.checked_items FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Checked: delete own" ON public.checked_items FOR DELETE TO authenticated USING (auth.uid() = owner_id);
