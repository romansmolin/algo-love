import 'server-only'

import { injectable } from 'inversify'
import type { message, Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/database/prisma'

type ListInput = {
    conversationId: string
    before?: Date
    limit: number
}

type CreateInput = {
    conversationId: string
    senderDatingId: number
    body: string
    legacyId?: string
    idempotencyKey?: string
    deliveredAt?: Date
}

type LatestPreviewInput = {
    conversationId: string
}

@injectable()
export class MessageRepository {
    async list(input: ListInput): Promise<message[]> {
        const where: Prisma.messageWhereInput = { conversationId: input.conversationId }
        if (input.before) {
            where.createdAt = { lt: input.before }
        }

        return prisma.message.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: input.limit,
        })
    }

    async create(input: CreateInput): Promise<message> {
        return prisma.message.create({
            data: {
                conversationId: input.conversationId,
                senderDatingId: input.senderDatingId,
                body: input.body,
                legacyId: input.legacyId,
                idempotencyKey: input.idempotencyKey,
                deliveredAt: input.deliveredAt,
            },
        })
    }

    async findByIdempotencyKey(
        conversationId: string,
        idempotencyKey: string,
    ): Promise<message | null> {
        return prisma.message.findUnique({
            where: {
                conversationId_idempotencyKey: { conversationId, idempotencyKey },
            },
        })
    }

    async latestPreview(input: LatestPreviewInput): Promise<message | null> {
        return prisma.message.findFirst({
            where: { conversationId: input.conversationId },
            orderBy: { createdAt: 'desc' },
        })
    }
}
