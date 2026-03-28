-- 003: Pet health system — completed reminders + neglect tracking
-- Run in Supabase SQL Editor

ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS completed     BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS completed_at  TIMESTAMPTZ;

ALTER TABLE public.virtual_pets
  ADD COLUMN IF NOT EXISTS last_tended_at TIMESTAMPTZ;
