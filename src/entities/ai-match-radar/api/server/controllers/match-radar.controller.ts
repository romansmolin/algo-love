import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { ensureActiveAIUnlock } from '@/entities/ai-unlock/server'
import { UserProfileService } from '@/entities/user/api/server/services/user-profile.service'
import { MatchRadarService } from '../services/match-radar.service'

const bodySchema = z.object({
    candidateDatingId: z.number().int().positive(),
})

@injectable()
export class MatchRadarController {
    constructor(
        @inject(MatchRadarService) private radar: MatchRadarService,
        @inject(UserProfileService) private profileService: UserProfileService,
    ) {}

    async analyze(request: NextRequest): Promise<NextResponse> {
        const userId = await resolveAppUserId(request)
        await ensureActiveAIUnlock(userId)

        const sessionId = request.cookies.get('dating_session_id')?.value
        if (!sessionId) throw AppError.authenticationError('Authentication required')

        const datingUserIdRaw = request.cookies.get('dating_user_id')?.value
        const datingUserId = datingUserIdRaw ? Number.parseInt(datingUserIdRaw, 10) : NaN
        if (!Number.isFinite(datingUserId) || datingUserId < 1) {
            throw AppError.authenticationError('Authentication required')
        }

        let body: unknown
        try {
            body = await request.json()
        } catch {
            throw AppError.validationError('Invalid JSON payload')
        }

        const parsed = bodySchema.safeParse(body)
        if (!parsed.success) {
            throw AppError.validationError(
                'Invalid match radar payload',
                parsed.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            )
        }

        const [me, candidate] = await Promise.all([
            this.profileService.getProfile(sessionId, datingUserId),
            this.profileService.getProfile(sessionId, parsed.data.candidateDatingId),
        ])

        const result = await this.radar.run({
            userId,
            me: me.user,
            candidate: candidate.user,
        })

        return NextResponse.json(result)
    }
}
