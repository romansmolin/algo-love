import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { ensureActiveAIUnlock } from '@/entities/ai-unlock/server'
import {
    BIO_REWRITE_TONES,
    BioRewriteStudioService,
} from '../services/bio-rewrite-studio.service'

const bodySchema = z.object({
    bio: z.string().trim().min(1).max(2000),
    tone: z.enum(BIO_REWRITE_TONES),
})

@injectable()
export class BioRewriteStudioController {
    constructor(@inject(BioRewriteStudioService) private studio: BioRewriteStudioService) {}

    async rewrite(request: NextRequest): Promise<NextResponse> {
        const userId = await resolveAppUserId(request)
        await ensureActiveAIUnlock(userId)

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
                'Invalid bio rewrite payload',
                parsed.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            )
        }

        const result = await this.studio.run({
            userId,
            userDatingId: datingUserId,
            bio: parsed.data.bio,
            tone: parsed.data.tone,
        })

        return NextResponse.json(result)
    }
}
