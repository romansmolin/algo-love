import 'server-only'

import { injectable } from 'inversify'
import type { conversation } from '@prisma/client'
import { prisma } from '@/shared/lib/database/prisma'

type EnsureInput = {
    userId: string
    peerDatingId: number
}

type TouchInput = {
    conversationId: string
    lastMessageAt: Date
}

@injectable()
export class ConversationRepository {
    async listForUser(userId: string): Promise<conversation[]> {
        return prisma.conversation.findMany({
            where: { userId },
            orderBy: [{ lastMessageAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        })
    }

    async ensure(input: EnsureInput): Promise<conversation> {
        return prisma.conversation.upsert({
            where: {
                userId_peerDatingId: {
                    userId: input.userId,
                    peerDatingId: input.peerDatingId,
                },
            },
            update: {},
            create: {
                userId: input.userId,
                peerDatingId: input.peerDatingId,
            },
        })
    }

    async findByPeer(userId: string, peerDatingId: number): Promise<conversation | null> {
        return prisma.conversation.findUnique({
            where: { userId_peerDatingId: { userId, peerDatingId } },
        })
    }

    async touch(input: TouchInput): Promise<void> {
        await prisma.conversation.update({
            where: { id: input.conversationId },
            data: { lastMessageAt: input.lastMessageAt },
        })
    }

    async markRead(conversationId: string, at: Date): Promise<void> {
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastReadAt: at },
        })
    }

    async unreadCount(conversationId: string, lastReadAt: Date | null): Promise<number> {
        return prisma.message.count({
            where: {
                conversationId,
                ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
            },
        })
    }
}
