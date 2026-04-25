import 'server-only'

import { inject, injectable } from 'inversify'
import type { InteractionAction } from '@prisma/client'
import type { MatchAction, MatchActionResponse } from '@/entities/match/model/types'
import { MatchRepository } from '../repositories/match.repo'
import { MatchInteractionRepository } from '../repositories/match-interaction.repo'

type SubmitInput = {
    appUserId: string
    sessionId: string
    targetDatingId: number
    action: MatchAction
}

const toInteractionAction = (action: MatchAction): InteractionAction => {
    if (action === 'like') return 'LIKE'
    if (action === 'dislike') return 'DISLIKE'
    return 'SKIP'
}

@injectable()
export class SubmitMatchActionUseCase {
    constructor(
        @inject(MatchRepository) private matchRepo: MatchRepository,
        @inject(MatchInteractionRepository)
        private interactionRepo: MatchInteractionRepository,
    ) {}

    async execute(input: SubmitInput): Promise<MatchActionResponse> {
        const interactionAction = toInteractionAction(input.action)

        // Persist locally first; idempotent on (userId, targetDatingId, action).
        await this.interactionRepo.record({
            userId: input.appUserId,
            targetDatingId: input.targetDatingId,
            action: interactionAction,
        })

        // Skips are local-only — legacy upstream has no skip primitive.
        if (input.action === 'skip') {
            return { result: 'skipped', isMatch: false }
        }

        const upstream =
            input.action === 'like'
                ? await this.matchRepo.setLike(input.sessionId, input.targetDatingId)
                : await this.matchRepo.setDislike(input.sessionId, input.targetDatingId)

        return {
            result: upstream.result,
            isMatch: upstream.result === 'match',
        }
    }
}
