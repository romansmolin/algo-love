import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { GetUserDetailsUseCase } from '../use-cases/get-user-details.usecase'

const parseDatingId = (raw: string | undefined): number => {
    if (!raw) {
        throw AppError.validationError('Invalid user id', [
            { field: 'datingId', message: 'datingId is required' },
        ])
    }

    const parsed = Number.parseInt(raw, 10)

    if (!Number.isFinite(parsed) || parsed < 1) {
        throw AppError.validationError('Invalid user id', [
            { field: 'datingId', message: 'datingId must be a positive integer' },
        ])
    }

    return parsed
}

const getSessionId = (request: NextRequest): string => {
    const sessionId = request.cookies.get('dating_session_id')?.value

    if (!sessionId) {
        throw AppError.authenticationError('Authentication required')
    }

    return sessionId
}

@injectable()
export class GetUserDetailsController {
    constructor(
        @inject(GetUserDetailsUseCase) private useCase: GetUserDetailsUseCase,
    ) {}

    async getDetails(
        request: NextRequest,
        params: { datingId?: string },
    ): Promise<NextResponse> {
        const sessionId = getSessionId(request)
        const appUserId = await resolveAppUserId(request)
        const targetDatingId = parseDatingId(params.datingId)

        const response = await this.useCase.execute({
            sessionId,
            appUserId,
            targetDatingId,
        })

        return NextResponse.json(response)
    }
}
