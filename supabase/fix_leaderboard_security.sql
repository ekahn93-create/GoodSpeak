-- ============================================
-- SECURITY FIX: Leaderboard View
-- Run this ONCE in your Supabase SQL editor.
--
-- Resolves two Supabase security advisories:
--   1. leaderboard view uses SECURITY DEFINER (accesses auth.users)
--   2. leaderboard view exposes auth.users data to anon/authenticated roles
--
-- Solution: introduce public.profiles table as the safe indirection layer,
-- then rewrite the view with security_invoker=true joining only public schema.
-- ============================================


-- ── STEP 1: Create public.profiles ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text        NOT NULL DEFAULT '',
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles readable by all"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "users insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);


-- ── STEP 2: Backfill existing users ──────────────────────────────────────────

INSERT INTO public.profiles (user_id, display_name)
SELECT
  id,
  COALESCE(
    raw_user_meta_data->>'nickname',
    raw_user_meta_data->>'first_name',
    split_part(email, '@', 1)
  )
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;


-- ── STEP 3: Trigger — auto-populate on new signup ────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nickname',
      NEW.raw_user_meta_data->>'first_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Restrict direct execution — only the trigger should call this
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── STEP 4: Drop and recreate leaderboard view ───────────────────────────────
-- Uses security_invoker=true (no SECURITY DEFINER) and joins only public schema.

DROP VIEW IF EXISTS public.leaderboard;

CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = true)
AS
SELECT
  ps.user_id,
  COALESCE(p.display_name, 'Player')   AS display_name,
  ROUND(AVG(ps.score))::int            AS avg_score,
  MAX(ps.score)                        AS best_score,
  COUNT(*)::int                        AS games_played,
  COALESCE(st.current_streak, 0)       AS current_streak
FROM (
  SELECT
    user_id,
    score,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY played_at DESC) AS rn
  FROM public.play_sessions
) ps
LEFT JOIN public.profiles p  ON p.user_id  = ps.user_id
LEFT JOIN public.streaks   st ON st.user_id = ps.user_id
WHERE ps.rn <= 5
GROUP BY ps.user_id, p.display_name, st.current_streak
ORDER BY avg_score DESC;

GRANT SELECT ON public.leaderboard TO anon, authenticated;
