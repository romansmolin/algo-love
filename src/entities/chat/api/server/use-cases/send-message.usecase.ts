import 'server-only'

import { inject, injectable } from 'inversify'
import type { message } from '@prisma/client'
import { AppError } from '@/shared/errors/app-error'
import { ErrorCode } from '@/shared/errors/error-codes'
import type {
    ConversationMessage,
    SendConversationMessageResponse,
} from '@/entities/chat/model/types'
import { MatchInteractionRepository } from '@/entities/match/api/server/repositories/match-interaction.repo'
import { MatchService } from '@/entities/match/api/server/services/match.service'
import { ConversationRepository } from '../repositories/conversation.repo'
import { MessageRepository } from '../repositories/message.repo'
import { ChatRepository } from '../repositories/chat.repo'
import { publishChatEvent } from '../services/chat-events'

type SendInput = {
    appUserId: string
    sessionId: string
    actorDatingId: number
    peerDatingId: number
    body: string
    idempotencyKey: string
}

const SHADOW_USER_ID_PREFIX = 'dating:'

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
export class SendConversationMessageUseCase {
    constructor(
        @inject(ConversationRepository) private conversationRepo: ConversationRepository,
        @inject(MessageRepository) private messageRepo: MessageRepository,
        @inject(ChatRepository) private chatRepo: ChatRepository,
        @inject(MatchInteractionRepository)
        private interactionRepo: MatchInteractionRepository,
        @inject(MatchService) private matchService: MatchService,
    ) {}

    async execute(input: SendInput): Promise<SendConversationMessageResponse> {
        await this.assertMutualMatch(input)

        // Idempotency: a duplicate POST with the same key short-circuits.
        const existing = await this.messageRepo.findByIdempotencyKey(
            await this.ensureConversationId(input),
            input.idempotencyKey,
        )

        if (existing) {
            return { message: toConversationMessage(existing) }
        }

        const conversation = await this.conversationRepo.ensure({
            userId: input.appUserId,
            peerDatingId: input.peerDatingId,
        })

        // Forward to legacy first so we can persist the upstream id and surface
        // delivery failures before committing locally.
        const upstream = await this.chatRepo.sendMessage({
            sessionId: input.sessionId,
            contactId: input.peerDatingId,
            message: input.body,
        })

        const now = new Date()
        const created = await this.messageRepo.create({
            conversationId: conversation.id,
            senderDatingId: input.actorDatingId,
            body: input.body,
            legacyId: upstream.id != null ? String(upstream.id) : undefined,
            idempotencyKey: input.idempotencyKey,
            deliveredAt: now,
        })

        await this.conversationRepo.touch({ conversationId: conversation.id, lastMessageAt: now })

        const messageDto = toConversationMessage(created)

        // Fan out to peer (incoming) and actor (multi-tab/device sync). Failure
        // here must not break the send, since the message is already persisted.
        try {
            await publishChatEvent([input.peerDatingId, input.actorDatingId], {
                type: 'message.created',
                conversationId: conversation.id,
                peerDatingId: input.peerDatingId,
                message: messageDto,
            })
        } catch (error) {
            console.error('[send-message] failed to publish chat event', { error })
        }

        return { message: messageDto }
    }

    private async ensureConversationId(input: SendInput): Promise<string> {
        const conversation = await this.conversationRepo.ensure({
            userId: input.appUserId,
            peerDatingId: input.peerDatingId,
        })
        return conversation.id
    }

    private async assertMutualMatch(input: SendInput): Promise<void> {
        // Local mutual: both users have a LIKE row pointing at the other.
        const actorLikedPeer = await this.interactionRepo.hasLiked(
            input.appUserId,
            input.peerDatingId,
        )

        if (actorLikedPeer) {
            const peerShadowUserId = `${SHADOW_USER_ID_PREFIX}${input.peerDatingId}`
            const peerLikedActor = await this.interactionRepo.hasLiked(
                peerShadowUserId,
                input.actorDatingId,
            )

            if (peerLikedActor) return
        }

        // Legacy fallback: legacy upstream considers them matched.
        const legacy = await this.matchService.listMatches(input.sessionId)
        const peerInLegacyMatches = legacy.items.some((item) => item.id === input.peerDatingId)

        if (peerInLegacyMatches) return

        throw new AppError('You can only message mutual matches.', ErrorCode.NOT_MATCHED, 409)
    }
}
