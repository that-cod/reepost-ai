-- Migration: Add Trending Post Fields
-- This SQL can be run directly in your Supabase SQL Editor or any PostgreSQL client

-- Add new columns to TrendingCreator
ALTER TABLE "TrendingCreator" 
ADD COLUMN IF NOT EXISTS "username" TEXT,
ADD COLUMN IF NOT EXISTS "headline" TEXT;

-- Make linkedinUrl unique (if not already)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'TrendingCreator_linkedinUrl_key'
    ) THEN
        ALTER TABLE "TrendingCreator" 
        ADD CONSTRAINT "TrendingCreator_linkedinUrl_key" UNIQUE ("linkedinUrl");
    END IF;
END
$$;

-- Create indexes for TrendingCreator
CREATE INDEX IF NOT EXISTS "TrendingCreator_linkedinUrl_idx" ON "TrendingCreator"("linkedinUrl");
CREATE INDEX IF NOT EXISTS "TrendingCreator_username_idx" ON "TrendingCreator"("username");

-- Add new columns to TrendingPost
ALTER TABLE "TrendingPost"
ADD COLUMN IF NOT EXISTS "linkedInPostId" TEXT,
ADD COLUMN IF NOT EXISTS "postUrl" TEXT,
ADD COLUMN IF NOT EXISTS "postType" TEXT,
ADD COLUMN IF NOT EXISTS "wordCount" INTEGER,
ADD COLUMN IF NOT EXISTS "hasQuestion" BOOLEAN,
ADD COLUMN IF NOT EXISTS "hasCallToAction" BOOLEAN,
ADD COLUMN IF NOT EXISTS "postedHour" INTEGER,
ADD COLUMN IF NOT EXISTS "postedDayOfWeek" TEXT;

-- Make linkedInPostId unique (if not already)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'TrendingPost_linkedInPostId_key'
    ) THEN
        ALTER TABLE "TrendingPost" 
        ADD CONSTRAINT "TrendingPost_linkedInPostId_key" UNIQUE ("linkedInPostId");
    END IF;
END
$$;

-- Update mediaType default if needed (change from IMAGE to NONE)
-- Note: This doesn't change existing records, only the default for new records
ALTER TABLE "TrendingPost" 
ALTER COLUMN "mediaType" SET DEFAULT 'NONE';

-- Create indexes for TrendingPost
CREATE INDEX IF NOT EXISTS "TrendingPost_linkedInPostId_idx" ON "TrendingPost"("linkedInPostId");
CREATE INDEX IF NOT EXISTS "TrendingPost_postedDayOfWeek_idx" ON "TrendingPost"("postedDayOfWeek");
CREATE INDEX IF NOT EXISTS "TrendingPost_hasQuestion_idx" ON "TrendingPost"("hasQuestion");
CREATE INDEX IF NOT EXISTS "TrendingPost_hasCallToAction_idx" ON "TrendingPost"("hasCallToAction");

-- Verify the changes
SELECT 
    'TrendingCreator' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'TrendingCreator'
ORDER BY ordinal_position;

SELECT 
    'TrendingPost' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'TrendingPost'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Added 2 columns to TrendingCreator';
    RAISE NOTICE 'Added 8 columns to TrendingPost';
    RAISE NOTICE 'Created 6 new indexes';
END
$$;
