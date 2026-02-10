import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { MatchService } from '../services/match.service'

const matchActionBodySchema = z.object({
    userId: z.number().int().positive('userId must be a positive integer'),
    action: z.enum(['like', 'dislike']),
})

@injectable()
export class MatchController {
    constructor(@inject(MatchService) private matchService: MatchService) {}

    private getSessionId(request: NextRequest): string {
        const sessionId = request.cookies.get('dating_session_id')?.value

        if (!sessionId) {
            throw AppError.authenticationError('Authentication required')
        }

        return sessionId
    }

    async discoverMatches(request: NextRequest): Promise<NextResponse> {
        const sessionId = this.getSessionId(request)
        const { searchParams } = new URL(request.url)

        const response = await this.matchService.discoverMatches(sessionId, searchParams)

        return NextResponse.json(response)
    }

    async listMatches(request: NextRequest): Promise<NextResponse> {
        const sessionId = this.getSessionId(request)
        const response = await this.matchService.listMatches(sessionId)

        return NextResponse.json(response)
    }

    async submitAction(request: NextRequest): Promise<NextResponse> {
        const sessionId = this.getSessionId(request)

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

        const response = await this.matchService.submitAction(
            sessionId,
            parsed.data.userId,
            parsed.data.action,
        )

        return NextResponse.json(response)
    }
}
