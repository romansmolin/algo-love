export type AIGateResult<T> = {
    output: T
    cached: boolean
    costCoins: number
}

export type ProfileAnalyzerResult = {
    overallScore: number
    summary: string
    items: Array<{
        category: string
        severity: 'low' | 'medium' | 'high'
        message: string
        suggestion: string
    }>
}

export type PhotoSpotlightResult = {
    recommendedPrimaryIndex: number
    ordering: number[]
    notes: Array<{
        index: number
        strengths: string[]
        improvements: string[]
        score: number
    }>
}

export type MatchRadarPayload = {
    candidateDatingId: number
}

export type MatchRadarResult = {
    compatibility: 'low' | 'medium' | 'high'
    score: number
    signals: string[]
    risks: string[]
    opener: string
}

export const BIO_REWRITE_TONES = [
    'witty',
    'warm',
    'confident',
    'playful',
    'sincere',
    'mysterious',
] as const
export type BioRewriteTone = (typeof BIO_REWRITE_TONES)[number]

export type BioRewriteStudioPayload = {
    bio: string
    tone: BioRewriteTone
}

export type BioRewriteStudioResult = {
    rewrite: string
    alternative?: string
    notes: string[]
}
