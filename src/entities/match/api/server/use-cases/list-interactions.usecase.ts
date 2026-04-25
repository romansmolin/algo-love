import 'server-only'

import { inject, injectable } from 'inversify'
import type { match_interaction } from '@prisma/client'
import { AppError } from '@/shared/errors/app-error'
import type {
    InteractionDirection,
    InteractionItem,
    InteractionsResponse,
    MatchCandidate,
    MatchGender,
} from '@/entities/match/model/types'
import { UserProfileService } from '@/entities/user/api/server/services/user-profile.service'
import type { UserProfile } from '@/entities/user/model/types'
import { MatchInteractionRepository } from '../repositories/match-interaction.repo'

type Input = {
    appUserId: string
    actorDatingId: number
    sessionId: string
    direction: InteractionDirection
    before: string | null
    limit: number
}

const SHADOW_USER_ID_PREFIX = 'dating:'

const decodeCursor = (raw: string | null): Date | null => {
    if (!raw) return null

    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) {
        throw AppError.validationError('Invalid cursor', [
            { field: 'before', message: 'before must be an ISO timestamp' },
        ])
    }
    return date
}

const peerDatingIdFromRow = (row: match_interaction, direction: InteractionDirection): number | null => {
    if (direction === 'outgoing') {
        return row.targetDatingId
    }

    if (!row.userId.startsWith(SHADOW_USER_ID_PREFIX)) return null
    const tail = row.userId.slice(SHADOW_USER_ID_PREFIX.length)
    const parsed = Number.parseInt(tail, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const userGenderToMatchGender = (gender: UserProfile['gender']): MatchGender | undefined => {
    if (gender === 'man') return 'man'
    if (gender === 'woman') return 'woman'
    if (gender === 'couple') return 'couple'
    return undefined
}

const toCandidate = (datingId: number, profile: UserProfile): MatchCandidate => {
    const candidate: MatchCandidate = {
        id: datingId,
        username: profile.username,
    }

    if (profile.age !== undefined) candidate.age = profile.age
    const gender = userGenderToMatchGender(profile.gender)
    if (gender) candidate.gender = gender
    if (profile.location) candidate.location = profile.location
    const photoUrl = profile.avatarUrl ?? profile.photos?.[0]?.large ?? profile.photos?.[0]?.medium
    if (photoUrl) candidate.photoUrl = photoUrl
    if (profile.photoCount !== undefined) candidate.photoCount = profile.photoCount

    return candidate
}

@injectable()
export class ListInteractionsUseCase {
    constructor(
        @inject(MatchInteractionRepository)
        private interactionRepo: MatchInteractionRepository,
        @inject(UserProfileService) private profileService: UserProfileService,
    ) {}

    async execute(input: Input): Promise<InteractionsResponse> {
        const before = decodeCursor(input.before)

        const rows =
            input.direction === 'outgoing'
                ? await this.interactionRepo.listOutgoingLikes({
                      userId: input.appUserId,
                      before: before ?? undefined,
                      limit: input.limit,
                  })
                : await this.interactionRepo.listIncomingLikes({
                      actorDatingId: input.actorDatingId,
                      before: before ?? undefined,
                      limit: input.limit,
                  })

        const items: InteractionItem[] = await Promise.all(
            rows.map(async (row): Promise<InteractionItem> => {
                const peerDatingId = peerDatingIdFromRow(row, input.direction)
                if (peerDatingId == null) {
                    return {
                        datingId: 0,
                        createdAt: row.createdAt.toISOString(),
                        profile: null,
                    }
                }

                let profile: MatchCandidate | null = null
                try {
                    const fetched = await this.profileService.getProfile(
                        input.sessionId,
                        peerDatingId,
                    )
                    profile = toCandidate(peerDatingId, fetched.user)
                } catch (error) {
                    console.warn('[list-interactions] profile fetch failed', {
                        peerDatingId,
                        error,
                    })
                }

                return {
                    datingId: peerDatingId,
                    createdAt: row.createdAt.toISOString(),
                    profile,
                }
            }),
        )

        const nextCursor =
            rows.length === input.limit ? rows[rows.length - 1].createdAt.toISOString() : null

        return { direction: input.direction, items, nextCursor }
    }
}
