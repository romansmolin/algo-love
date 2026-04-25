import type { AiFeatureKey } from '@prisma/client'

export type AIFeatureConfig = {
    costCoins: number
    rateLimitPerMinute: number
    cacheTtlSeconds: number | null
}

export const AI_FEATURE_CONFIG: Record<AiFeatureKey, AIFeatureConfig> = {
    profile_analyzer: { costCoins: 5, rateLimitPerMinute: 5, cacheTtlSeconds: 86_400 },
    photo_spotlight: { costCoins: 8, rateLimitPerMinute: 3, cacheTtlSeconds: 86_400 },
    match_radar: { costCoins: 4, rateLimitPerMinute: 10, cacheTtlSeconds: 3_600 },
    bio_rewrite_studio: { costCoins: 6, rateLimitPerMinute: 5, cacheTtlSeconds: null },
}
