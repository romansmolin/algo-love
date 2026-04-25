import 'server-only'

import { inject, injectable } from 'inversify'
import type { message } from '@prisma/client'
import { AppError } from '@/shared/errors/app-error'
import type {
    ConversationMessage,
    ConversationMessagesResponse,
} from '@/entities/chat/model/types'
import { ConversationRepository } from '../repositories/conversation.repo'
import { MessageRepository } from '../repositories/message.repo'

type ListInput = {
    appUserId: string
    peerDatingId: number
    before: string | null
    limit: number
}

const decodeCursor = (raw: string | null): Date | null => {
    if (!raw) return null

    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) {
        throw AppError.validationError('Invalid cursor', [
            { field: 'before', message: 'before must be an ISO timestamp' },
        ])
    }

    return date
}

const toConversationMessage = (row: message): ConversationMessage => ({
    id: row.id,
    legacyId: row.legacyId,
    senderDatingId: row.senderDatingId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    deliveredAt: row.deliveredAt?.toISOString() ?? null,
    readAt: row.readAt?.toISOString() ?? null,
})

@injectable()
export class ListMessagesUseCase {
    constructor(
        @inject(ConversationRepository) private conversationRepo: ConversationRepository,
        @inject(MessageRepository) private messageRepo: MessageRepository,
    ) {}

    async execute(input: ListInput): Promise<ConversationMessagesResponse> {
        const conversation = await this.conversationRepo.findByPeer(
            input.appUserId,
            input.peerDatingId,
        )

        if (!conversation) {
            return { messages: [], nextCursor: null }
        }

        const before = decodeCursor(input.before)
        const rows = await this.messageRepo.list({
            conversationId: conversation.id,
            before: before ?? undefined,
            limit: input.limit,
        })

        const messages = rows.map(toConversationMessage)
        const nextCursor =
            rows.length === input.limit ? rows[rows.length - 1].createdAt.toISOString() : null

        return { messages, nextCursor }
    }
}
