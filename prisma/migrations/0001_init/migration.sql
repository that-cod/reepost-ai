-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "viral_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "hook_style" TEXT NOT NULL,
    "viral_score" REAL NOT NULL,
    "embedding" vector(1536),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viral_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_viral_posts_embedding" ON "viral_posts" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
