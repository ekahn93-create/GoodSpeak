-- ============================================
-- GAME TABLES SCHEMA
-- Run this ONCE in your Supabase SQL editor
-- Adds game features alongside the existing user_progress table
-- Order matters — run top to bottom
-- ============================================


-- ── 1. WORDS ─────────────────────────────────────────────────────────────────
-- The curated word list used by the 30-second game.
-- Read-only to all users; only editable by you via the Supabase dashboard.

CREATE TABLE public.words (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  word        text        UNIQUE NOT NULL,
  definition  text        NOT NULL,
  difficulty  int         NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  synonyms    text[]      NOT NULL DEFAULT '{}',
  antonyms    text[]      NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "words readable by all" ON public.words FOR SELECT USING (true);


-- ── 2. PLAY SESSIONS ─────────────────────────────────────────────────────────
-- One row per completed game. Powers the leaderboard.

CREATE TABLE public.play_sessions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score          int         NOT NULL CHECK (score >= 0),
  correct_count  int         NOT NULL CHECK (correct_count >= 0),
  total_answered int         NOT NULL CHECK (total_answered >= 0),
  played_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.play_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions readable by all"    ON public.play_sessions FOR SELECT USING (true);
CREATE POLICY "users insert own session"    ON public.play_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ── 3. DAILY PLAYED WORDS ────────────────────────────────────────────────────
-- Tracks which words a user has already seen today so they aren't repeated.
-- Resets automatically each UTC day (the played_on date changes).

CREATE TABLE public.daily_played_words (
  id         uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id    uuid  NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  played_on  date  NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  UNIQUE (user_id, word_id, played_on)
);

CREATE INDEX idx_daily_played_words_user_day ON public.daily_played_words (user_id, played_on);

ALTER TABLE public.daily_played_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own daily played"   ON public.daily_played_words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own daily played" ON public.daily_played_words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own daily played" ON public.daily_played_words FOR DELETE USING (auth.uid() = user_id);


-- ── 4. INCORRECT PLAY WORDS ──────────────────────────────────────────────────
-- Words the user got wrong in the game — shown in the "Learn These" section.
-- Cleared when the user masters the word in the Learn flow.

CREATE TABLE public.incorrect_play_words (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id   uuid        NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  added_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, word_id)
);

CREATE INDEX idx_incorrect_play_words_user ON public.incorrect_play_words (user_id);

ALTER TABLE public.incorrect_play_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own incorrect"   ON public.incorrect_play_words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own incorrect" ON public.incorrect_play_words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own incorrect" ON public.incorrect_play_words FOR DELETE USING (auth.uid() = user_id);


-- ── 5. STREAKS ───────────────────────────────────────────────────────────────
-- One row per user. Updated automatically by a trigger on play_sessions.

CREATE TABLE public.streaks (
  user_id        uuid  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int   NOT NULL DEFAULT 0,
  longest_streak int   NOT NULL DEFAULT 0,
  last_played_on date,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks readable by all"   ON public.streaks FOR SELECT USING (true);
CREATE POLICY "users insert own streak"   ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own streak"   ON public.streaks FOR UPDATE USING (auth.uid() = user_id);

-- Trigger: automatically update streak whenever a play session is inserted
CREATE OR REPLACE FUNCTION public.bump_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today  date := (now() AT TIME ZONE 'utc')::date;
  rec    public.streaks%ROWTYPE;
  new_current int;
BEGIN
  SELECT * INTO rec FROM public.streaks WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    -- First ever game for this user
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_played_on)
    VALUES (NEW.user_id, 1, 1, today);
    RETURN NEW;
  END IF;

  IF rec.last_played_on = today THEN
    -- Already played today — streak unchanged
    new_current := rec.current_streak;
  ELSIF rec.last_played_on = today - 1 THEN
    -- Played yesterday — extend streak
    new_current := rec.current_streak + 1;
  ELSE
    -- Gap of more than one day — reset streak
    new_current := 1;
  END IF;

  UPDATE public.streaks
  SET
    current_streak = new_current,
    longest_streak = GREATEST(rec.longest_streak, new_current),
    last_played_on = today,
    updated_at     = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Lock down direct execution (trigger runs as security definer)
REVOKE EXECUTE ON FUNCTION public.bump_streak() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_play_session_bump_streak
AFTER INSERT ON public.play_sessions
FOR EACH ROW EXECUTE FUNCTION public.bump_streak();


-- ── 6. CHALLENGES ────────────────────────────────────────────────────────────
-- Stores "Challenge a Friend" sessions.
-- Public read + insert so friends can open links without signing in.

CREATE TABLE public.challenges (
  code               text  PRIMARY KEY,
  challenger_user_id uuid,  -- nullable: anonymous users can also challenge
  challenger_name    text  NOT NULL,
  word_ids           uuid[] NOT NULL,
  challenger_score   int   NOT NULL,
  challenger_correct int   NOT NULL,
  challenger_total   int   NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT challenges_code_len      CHECK (length(code) BETWEEN 4 AND 16),
  CONSTRAINT challenges_name_len      CHECK (length(challenger_name) BETWEEN 1 AND 40),
  CONSTRAINT challenges_word_ids_len  CHECK (array_length(word_ids, 1) BETWEEN 1 AND 80),
  CONSTRAINT challenges_score_range   CHECK (challenger_score BETWEEN 0 AND 100000),
  CONSTRAINT challenges_correct_range CHECK (challenger_correct BETWEEN 0 AND 500),
  CONSTRAINT challenges_total_range   CHECK (challenger_total BETWEEN 0 AND 500)
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges readable by all" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "anyone can create challenge" ON public.challenges FOR INSERT WITH CHECK (true);


-- ── 7. PROFILES ───────────────────────────────────────────────────────────────
-- Public display name per user. Populated on signup/login by the browser client
-- and by the trigger below. This keeps the leaderboard view out of auth.users,
-- which would expose PII and trigger Supabase security advisories.

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text        NOT NULL DEFAULT '',
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "users insert own profile"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own profile"   ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Trigger: auto-create a profile row when a new auth user is created
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

-- Lock down direct execution (trigger runs as security definer)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 8. LEADERBOARD VIEW ──────────────────────────────────────────────────────
-- Pre-computed top scores per user (average of last 5 games).
-- Joins public.profiles instead of auth.users — no PII exposed, no SECURITY DEFINER.
-- Used by the Rank/leaderboard feature. Query this view, not play_sessions directly.

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
  -- Last 5 sessions per user
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

-- Allow all authenticated and anonymous users to read the leaderboard
GRANT SELECT ON public.leaderboard TO anon, authenticated;
