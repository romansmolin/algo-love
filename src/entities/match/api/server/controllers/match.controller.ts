import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { MatchService } from '../services/match.service'
import { SubmitMatchActionUseCase } from '../use-cases/submit-match-action.usecase'

const matchActionBodySchema = z.object({
    userId: z.number().int().positive('userId must be a positive integer'),
    action: z.enum(['like', 'dislike', 'skip']),
})

@injectable()
export class MatchController {
    constructor(
        @inject(MatchService) private matchService: MatchService,
        @inject(SubmitMatchActionUseCase)
        private submitMatchAction: SubmitMatchActionUseCase,
    ) {}

    private getSessionId(request: NextRequest): string {
        const sessionId = request.cookies.get('dating_session_id')?.value

        if (!sessionId) {
            throw AppError.authenticationError('Authentication required')
        }

        return sessionId
    }

    async discoverMatches(request: NextRequest): Promise<NextResponse> {
        const sessionId = this.getSessionId(request)
        const appUserId = await resolveAppUserId(request)
        const { searchParams } = new URL(request.url)

        const response = await this.matchService.discoverMatches(
            sessionId,
            appUserId,
            searchParams,
        )

        return NextResponse.json(response)
    }

    async listMatches(request: NextRequest): Promise<NextResponse> {
        const sessionId = this.getSessionId(request)
        const response = await this.matchService.listMatches(sessionId)

        return NextResponse.json(response)
    }

    async submitAction(request: NextRequest): Promise<NextResponse> {
        const sessionId = this.getSessionId(request)
        const appUserId = await resolveAppUserId(request)

        let body: unknown

        try {
            body = await request.json()
        } catch {
            throw AppError.validationError('Invalid JSON payload')
        }

        const parsed = matchActionBodySchema.safeParse(body)

        if (!parsed.success) {
            throw AppError.validationError(
                'Invalid match action payload',
                parsed.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            )
        }

        const response = await this.submitMatchAction.execute({
            appUserId,
            sessionId,
            targetDatingId: parsed.data.userId,
            action: parsed.data.action,
        })

        return NextResponse.json(response)
    }
}
