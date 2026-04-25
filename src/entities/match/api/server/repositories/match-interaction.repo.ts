import 'server-only'

import { injectable } from 'inversify'
import type { InteractionAction, InteractionSource, match_interaction } from '@prisma/client'
import { prisma } from '@/shared/lib/database/prisma'

type RecordInteractionInput = {
    userId: string
    targetDatingId: number
    action: InteractionAction
    source?: InteractionSource
}

@injectable()
export class MatchInteractionRepository {
    async listActedTargetIds(userId: string): Promise<Set<number>> {
        const rows = await prisma.match_interaction.findMany({
            where: { userId },
            select: { targetDatingId: true },
        })

        return new Set(rows.map((row) => row.targetDatingId))
    }

    async record(input: RecordInteractionInput): Promise<match_interaction> {
        const { userId, targetDatingId, action, source = 'FEED' } = input

        return prisma.match_interaction.upsert({
            where: {
                userId_targetDatingId_action: {
                    userId,
                    targetDatingId,
                    action,
                },
            },
            update: {},
            create: {
                userId,
                targetDatingId,
                action,
                source,
            },
        })
    }

    async hasLiked(userId: string, targetDatingId: number): Promise<boolean> {
        const row = await prisma.match_interaction.findUnique({
            where: {
                userId_targetDatingId_action: {
                    userId,
                    targetDatingId,
                    action: 'LIKE',
                },
            },
            select: { id: true },
        })

        return row != null
    }

    async findStateAgainst(
        userId: string,
        targetDatingId: number,
    ): Promise<InteractionAction | null> {
        const row = await prisma.match_interaction.findFirst({
            where: { userId, targetDatingId },
            orderBy: { createdAt: 'desc' },
            select: { action: true },
        })

        return row?.action ?? null
    }

    async listOutgoingLikes(input: {
        userId: string
        before?: Date
        limit: number
    }): Promise<match_interaction[]> {
        return prisma.match_interaction.findMany({
            where: {
                userId: input.userId,
                action: 'LIKE',
                ...(input.before ? { createdAt: { lt: input.before } } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: input.limit,
        })
    }

    async listIncomingLikes(input: {
        actorDatingId: number
        before?: Date
        limit: number
    }): Promise<match_interaction[]> {
        return prisma.match_interaction.findMany({
            where: {
                targetDatingId: input.actorDatingId,
                action: 'LIKE',
                ...(input.before ? { createdAt: { lt: input.before } } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: input.limit,
        })
    }
}
