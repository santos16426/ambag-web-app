-- Migration: Add image_url to groups table
-- Description: Adds optional image_url column for group avatars/backgrounds

ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.groups.image_url IS 'Optional image URL for group avatar or card background';
