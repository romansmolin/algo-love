import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { ensureActiveAIUnlock } from '@/entities/ai-unlock/server'
import { UserProfileService } from '@/entities/user/api/server/services/user-profile.service'
import { PhotoSpotlightService } from '../services/photo-spotlight.service'

@injectable()
export class PhotoSpotlightController {
    constructor(
        @inject(PhotoSpotlightService) private spotlight: PhotoSpotlightService,
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

        const profile = await this.profileService.getProfile(sessionId, datingUserId)
        const photoUrls =
            profile.user.photos
                ?.map((photo) => photo.large ?? photo.medium ?? photo.small)
                .filter((url): url is string => !!url) ?? []

        if (photoUrls.length === 0) {
            throw AppError.validationError('Add some photos to your profile first.', [
                { field: 'photos', message: 'profile must have at least one photo' },
            ])
        }

        const result = await this.spotlight.run({ userId, photoUrls })
        return NextResponse.json(result)
    }
}
