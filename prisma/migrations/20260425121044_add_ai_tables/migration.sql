-- AI domain: response cache, per-minute rate limit, time-based unlock pass.

CREATE TYPE "AiFeatureKey" AS ENUM (
    'profile_analyzer',
    'photo_spotlight',
    'match_radar',
    'bio_rewrite_studio'
);

CREATE TYPE "AiUnlockStatus" AS ENUM ('active', 'expired');

CREATE TABLE "ai_analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" "AiFeatureKey" NOT NULL,
    "subjectKey" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "output" JSONB NOT NULL,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "costCoins" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ai_analysis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_analysis_userId_feature_subjectKey_inputHash_key"
    ON "ai_analysis"("userId", "feature", "subjectKey", "inputHash");

CREATE INDEX "ai_analysis_userId_feature_createdAt_idx"
    ON "ai_analysis"("userId", "feature", "createdAt");

CREATE INDEX "ai_analysis_expiresAt_idx" ON "ai_analysis"("expiresAt");

ALTER TABLE "ai_analysis" ADD CONSTRAINT "ai_analysis_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ai_rate_bucket" (
    "userId" TEXT NOT NULL,
    "feature" "AiFeatureKey" NOT NULL,
    "windowAt" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ai_rate_bucket_pkey" PRIMARY KEY ("userId", "feature", "windowAt")
);

CREATE INDEX "ai_rate_bucket_windowAt_idx" ON "ai_rate_bucket"("windowAt");

CREATE TABLE "ai_unlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "AiUnlockStatus" NOT NULL DEFAULT 'active',
    "durationDays" INTEGER NOT NULL,
    "costCoins" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_unlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_unlock_userId_status_expiresAt_idx"
    ON "ai_unlock"("userId", "status", "expiresAt");

CREATE INDEX "ai_unlock_expiresAt_idx" ON "ai_unlock"("expiresAt");

ALTER TABLE "ai_unlock" ADD CONSTRAINT "ai_unlock_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
