import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { ListConversationsUseCase } from '../use-cases/list-conversations.usecase'
import { ListMessagesUseCase } from '../use-cases/list-messages.usecase'
import { MarkConversationReadUseCase } from '../use-cases/mark-conversation-read.usecase'
import { SendConversationMessageUseCase } from '../use-cases/send-message.usecase'

const sendBodySchema = z.object({
    body: z.string().trim().min(1, 'body must not be empty').max(5000, 'body too long'),
    idempotencyKey: z
        .string()
        .min(8, 'idempotencyKey must be at least 8 chars')
        .max(128, 'idempotencyKey too long'),
})

const DEFAULT_MESSAGES_LIMIT = 50
const MAX_MESSAGES_LIMIT = 100

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

const parsePeerDatingId = (raw: string | undefined): number => {
    if (!raw) {
        throw AppError.validationError('Invalid peer id', [
            { field: 'peerDatingId', message: 'peerDatingId is required' },
        ])
    }
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
        throw AppError.validationError('Invalid peer id', [
            { field: 'peerDatingId', message: 'peerDatingId must be a positive integer' },
        ])
    }
    return parsed
}

const parseMessagesLimit = (raw: string | null): number => {
    if (!raw) return DEFAULT_MESSAGES_LIMIT
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > MAX_MESSAGES_LIMIT) {
        throw AppError.validationError('Invalid limit', [
            { field: 'limit', message: `limit must be between 1 and ${MAX_MESSAGES_LIMIT}` },
        ])
    }
    return parsed
}

@injectable()
export class ConversationsController {
    constructor(
        @inject(ListConversationsUseCase)
        private listConversations: ListConversationsUseCase,
        @inject(ListMessagesUseCase) private listMessages: ListMessagesUseCase,
        @inject(SendConversationMessageUseCase)
        private sendMessage: SendConversationMessageUseCase,
        @inject(MarkConversationReadUseCase)
        private markRead: MarkConversationReadUseCase,
    ) {}

    async list(request: NextRequest): Promise<NextResponse> {
        const appUserId = await resolveAppUserId(request)
        const response = await this.listConversations.execute(appUserId)
        return NextResponse.json(response)
    }

    async getMessages(
        request: NextRequest,
        params: { peerDatingId?: string },
    ): Promise<NextResponse> {
        const appUserId = await resolveAppUserId(request)
        const peerDatingId = parsePeerDatingId(params.peerDatingId)
        const { searchParams } = new URL(request.url)
        const before = searchParams.get('before')
        const limit = parseMessagesLimit(searchParams.get('limit'))

        const response = await this.listMessages.execute({
            appUserId,
            peerDatingId,
            before,
            limit,
        })

        return NextResponse.json(response)
    }

    async send(request: NextRequest, params: { peerDatingId?: string }): Promise<NextResponse> {
        const appUserId = await resolveAppUserId(request)
        const sessionId = getSessionId(request)
        const actorDatingId = getActorDatingId(request)
        const peerDatingId = parsePeerDatingId(params.peerDatingId)

        let body: unknown
        try {
            body = await request.json()
        } catch {
            throw AppError.validationError('Invalid JSON payload')
        }

        const parsed = sendBodySchema.safeParse(body)
        if (!parsed.success) {
            throw AppError.validationError(
                'Invalid send-message payload',
                parsed.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            )
        }

        const response = await this.sendMessage.execute({
            appUserId,
            sessionId,
            actorDatingId,
            peerDatingId,
            body: parsed.data.body,
            idempotencyKey: parsed.data.idempotencyKey,
        })

        return NextResponse.json(response)
    }

    async markAsRead(
        request: NextRequest,
        params: { peerDatingId?: string },
    ): Promise<NextResponse> {
        const appUserId = await resolveAppUserId(request)
        const peerDatingId = parsePeerDatingId(params.peerDatingId)

        const response = await this.markRead.execute({ appUserId, peerDatingId })
        return NextResponse.json(response)
    }
}
