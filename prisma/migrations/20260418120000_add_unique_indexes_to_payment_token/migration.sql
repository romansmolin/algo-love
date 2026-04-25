-- Add trackingId + errorMessage columns, unique indexes on gatewayUid/gatewayToken/trackingId

ALTER TABLE "payment_token" ADD COLUMN "trackingId" TEXT;
ALTER TABLE "payment_token" ADD COLUMN "errorMessage" TEXT;

-- Drop any non-unique index on gatewayUid if it was present
DROP INDEX IF EXISTS "payment_token_gatewayUid_idx";

CREATE UNIQUE INDEX "payment_token_gatewayUid_key" ON "payment_token"("gatewayUid");
CREATE UNIQUE INDEX "payment_token_gatewayToken_key" ON "payment_token"("gatewayToken");
CREATE UNIQUE INDEX "payment_token_trackingId_key" ON "payment_token"("trackingId");
