import 'server-only'

import { inject, injectable } from 'inversify'
import { AppError } from '@/shared/errors/app-error'
import type { MarkConversationReadResponse } from '@/entities/chat/model/types'
import { ConversationRepository } from '../repositories/conversation.repo'

type MarkReadInput = {
    appUserId: string
    peerDatingId: number
}

@injectable()
export class MarkConversationReadUseCase {
    constructor(
        @inject(ConversationRepository) private conversationRepo: ConversationRepository,
    ) {}

    async execute(input: MarkReadInput): Promise<MarkConversationReadResponse> {
        const conversation = await this.conversationRepo.findByPeer(
            input.appUserId,
            input.peerDatingId,
        )

        if (!conversation) {
            throw AppError.notFoundError('Conversation not found')
        }

        const now = new Date()
        await this.conversationRepo.markRead(conversation.id, now)

        return { lastReadAt: now.toISOString() }
    }
}
