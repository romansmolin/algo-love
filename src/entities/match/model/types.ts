export type MatchGender = 'man' | 'woman' | 'couple'

export interface MatchCandidate {
    id: number
    username: string
    age?: number
    gender?: MatchGender
    location?: string
    rating?: number
    photoUrl?: string
    photoCount?: number
}

export interface DiscoverMatchesResponse {
    items: MatchCandidate[]
    nextCursor: string | null
    page?: number
    totalPages?: number
    total?: number
}

export interface MatchListResponse {
    items: MatchCandidate[]
    total: number
}

export type MatchAction = 'like' | 'dislike' | 'skip'

export interface MatchActionRequest {
    userId: number
    action: MatchAction
}

export interface MatchActionResponse {
    result?: string
    isMatch?: boolean
}

export type InteractionDirection = 'outgoing' | 'incoming'

export interface InteractionItem {
    datingId: number
    createdAt: string
    profile: MatchCandidate | null
}

export interface InteractionsResponse {
    direction: InteractionDirection
    items: InteractionItem[]
    nextCursor: string | null
}
