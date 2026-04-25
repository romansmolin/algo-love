import 'server-only'

import { injectable } from 'inversify'
import type { ai_unlock } from '@prisma/client'
import { prisma } from '@/shared/lib/database/prisma'

type CreateInput = {
    userId: string
    startAt: Date
    expiresAt: Date
    durationDays: number
    costCoins: number
}

@injectable()
export class AIUnlockRepository {
    async findActiveForUser(userId: string, now: Date): Promise<ai_unlock | null> {
        return prisma.ai_unlock.findFirst({
            where: {
                userId,
                status: 'active',
                expiresAt: { gt: now },
            },
            orderBy: { expiresAt: 'desc' },
        })
    }

    async expireStale(userId: string, now: Date): Promise<number> {
        const result = await prisma.ai_unlock.updateMany({
            where: {
                userId,
                status: 'active',
                expiresAt: { lte: now },
            },
            data: { status: 'expired' },
        })
        return result.count
    }

    async create(input: CreateInput): Promise<ai_unlock> {
        return prisma.ai_unlock.create({
            data: {
                userId: input.userId,
                startAt: input.startAt,
                expiresAt: input.expiresAt,
                durationDays: input.durationDays,
                costCoins: input.costCoins,
            },
        })
    }
}
