import 'server-only'

import { inject, injectable } from 'inversify'
import type { InteractionAction } from '@prisma/client'
import { AppError } from '@/shared/errors/app-error'
import type {
    UserDetailsResponse,
    UserInteractionState,
} from '@/entities/user/model/types'
import { UserProfileService } from '../services/user-profile.service'
import { MatchInteractionRepository } from '@/entities/match/api/server/repositories/match-interaction.repo'

type GetUserDetailsInput = {
    sessionId: string
    appUserId: string
    targetDatingId: number
}

const toInteractionState = (action: InteractionAction | null): UserInteractionState => {
    if (action === 'LIKE') return 'liked'
    if (action === 'DISLIKE') return 'disliked'
    if (action === 'SKIP') return 'skipped'
    return 'none'
}

@injectable()
export class GetUserDetailsUseCase {
    constructor(
        @inject(UserProfileService) private profileService: UserProfileService,
        @inject(MatchInteractionRepository)
        private interactionRepo: MatchInteractionRepository,
    ) {}

    async execute(input: GetUserDetailsInput): Promise<UserDetailsResponse> {
        if (!Number.isInteger(input.targetDatingId) || input.targetDatingId < 1) {
            throw AppError.validationError('Invalid user id', [
                { field: 'datingId', message: 'datingId must be a positive integer' },
            ])
        }

        const [profile, action] = await Promise.all([
            this.profileService.getProfile(input.sessionId, input.targetDatingId),
            this.interactionRepo.findStateAgainst(input.appUserId, input.targetDatingId),
        ])

        return {
            user: profile.user,
            interactionState: toInteractionState(action),
        }
    }
}
