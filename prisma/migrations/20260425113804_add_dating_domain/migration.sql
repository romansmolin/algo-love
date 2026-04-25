-- Dating domain: persisted match interactions, conversations, messages.

CREATE TYPE "InteractionAction" AS ENUM ('LIKE', 'DISLIKE', 'SKIP');
CREATE TYPE "InteractionSource" AS ENUM ('FEED', 'PROFILE', 'BACKFILL');

CREATE TABLE "match_interaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetDatingId" INTEGER NOT NULL,
    "action" "InteractionAction" NOT NULL,
    "source" "InteractionSource" NOT NULL DEFAULT 'FEED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_interaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "match_interaction_userId_targetDatingId_action_key"
    ON "match_interaction"("userId", "targetDatingId", "action");

CREATE INDEX "match_interaction_userId_createdAt_idx"
    ON "match_interaction"("userId", "createdAt" DESC);

CREATE INDEX "match_interaction_userId_targetDatingId_idx"
    ON "match_interaction"("userId", "targetDatingId");

ALTER TABLE "match_interaction" ADD CONSTRAINT "match_interaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "peerDatingId" INTEGER NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "lastReadAt" TIMESTAMP(3),
    "lastSeenLegacyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversation_userId_peerDatingId_key"
    ON "conversation"("userId", "peerDatingId");

CREATE INDEX "conversation_userId_lastMessageAt_idx"
    ON "conversation"("userId", "lastMessageAt" DESC);

ALTER TABLE "conversation" ADD CONSTRAINT "conversation_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "legacyId" TEXT,
    "senderDatingId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "message_conversationId_legacyId_key"
    ON "message"("conversationId", "legacyId");

CREATE UNIQUE INDEX "message_conversationId_idempotencyKey_key"
    ON "message"("conversationId", "idempotencyKey");

CREATE INDEX "message_conversationId_createdAt_idx"
    ON "message"("conversationId", "createdAt");

ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
