-- Add share token for public scrapbook link
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS share_token uuid UNIQUE;

CREATE INDEX IF NOT EXISTS profiles_share_token_idx ON public.profiles(share_token);