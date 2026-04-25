import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { ensureActiveAIUnlock } from '@/entities/ai-unlock/server'
import { UserProfileService } from '@/entities/user/api/server/services/user-profile.service'
import { ProfileAnalyzerService } from '../services/profile-analyzer.service'

@injectable()
export class ProfileAnalyzerController {
    constructor(
        @inject(ProfileAnalyzerService) private analyzer: ProfileAnalyzerService,
        @inject(UserProfileService) private profileService: UserProfileService,
    ) {}

    async analyze(request: NextRequest): Promise<NextResponse> {
        const userId = await resolveAppUserId(request)
        await ensureActiveAIUnlock(userId)

        const sessionId = request.cookies.get('dating_session_id')?.value
        if (!sessionId) {
            throw AppError.authenticationError('Authentication required')
        }

        const datingUserIdRaw = request.cookies.get('dating_user_id')?.value
        const datingUserId = datingUserIdRaw ? Number.parseInt(datingUserIdRaw, 10) : NaN
        if (!Number.isFinite(datingUserId) || datingUserId < 1) {
            throw AppError.authenticationError('Authentication required')
        }

        const profile = await this.profileService.getProfile(sessionId, datingUserId)
        const result = await this.analyzer.run({ userId, profile: profile.user })

        return NextResponse.json(result)
    }
}
