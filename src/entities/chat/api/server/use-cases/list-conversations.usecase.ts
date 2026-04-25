import 'server-only'

import { inject, injectable } from 'inversify'
import type { ConversationSummary, ConversationsListResponse } from '@/entities/chat/model/types'
import { ConversationRepository } from '../repositories/conversation.repo'
import { MessageRepository } from '../repositories/message.repo'

@injectable()
export class ListConversationsUseCase {
    constructor(
        @inject(ConversationRepository) private conversationRepo: ConversationRepository,
        @inject(MessageRepository) private messageRepo: MessageRepository,
    ) {}

    async execute(appUserId: string): Promise<ConversationsListResponse> {
        const conversations = await this.conversationRepo.listForUser(appUserId)

        const summaries: ConversationSummary[] = await Promise.all(
            conversations.map(async (conversation): Promise<ConversationSummary> => {
                const [latest, unreadCount] = await Promise.all([
                    this.messageRepo.latestPreview({ conversationId: conversation.id }),
                    this.conversationRepo.unreadCount(conversation.id, conversation.lastReadAt),
                ])

                return {
                    id: conversation.id,
                    peerDatingId: conversation.peerDatingId,
                    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
                    lastReadAt: conversation.lastReadAt?.toISOString() ?? null,
                    lastMessagePreview: latest?.body ?? null,
                    unreadCount,
                }
            }),
        )

        return { conversations: summaries }
    }
}
