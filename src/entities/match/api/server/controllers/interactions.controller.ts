import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { ListInteractionsUseCase } from '../use-cases/list-interactions.usecase'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

const getSessionId = (request: NextRequest): string => {
    const sessionId = request.cookies.get('dating_session_id')?.value
    if (!sessionId) throw AppError.authenticationError('Authentication required')
    return sessionId
}

const getActorDatingId = (request: NextRequest): number => {
    const raw = request.cookies.get('dating_user_id')?.value
    if (!raw) throw AppError.authenticationError('Authentication required')

    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
        throw AppError.authenticationError('Authentication required')
    }
    return parsed
}

const parseDirection = (raw: string | null): 'outgoing' | 'incoming' => {
    if (raw === 'outgoing' || raw === 'incoming') return raw

    throw AppError.validationError('Invalid direction', [
        { field: 'direction', message: 'direction must be "outgoing" or "incoming"' },
    ])
}

const parseLimit = (raw: string | null): number => {
    if (!raw) return DEFAULT_LIMIT

    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
        throw AppError.validationError('Invalid limit', [
            { field: 'limit', message: `limit must be between 1 and ${MAX_LIMIT}` },
        ])
    }
    return parsed
}

@injectable()
export class InteractionsController {
    constructor(
        @inject(ListInteractionsUseCase) private listInteractions: ListInteractionsUseCase,
    ) {}

    async list(request: NextRequest): Promise<NextResponse> {
        const appUserId = await resolveAppUserId(request)
        const sessionId = getSessionId(request)
        const actorDatingId = getActorDatingId(request)
        const { searchParams } = new URL(request.url)

        const direction = parseDirection(searchParams.get('direction'))
        const limit = parseLimit(searchParams.get('limit'))
        const before = searchParams.get('before')

        const response = await this.listInteractions.execute({
            appUserId,
            actorDatingId,
            sessionId,
            direction,
            limit,
            before,
        })

        return NextResponse.json(response)
    }
}
