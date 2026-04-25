import 'server-only'

import { inject, injectable } from 'inversify'
import { AppError } from '@/shared/errors/app-error'
import { SpendCreditsUseCase } from '@/entities/credit/api/server/use-cases/spend-credits.usecase'
import {
    AI_UNLOCK_PRODUCTS,
    findAIUnlockProduct,
} from '@/entities/ai-unlock/model/products'
import type {
    AIUnlockProduct,
    AIUnlockPurchaseResponse,
    AIUnlockStatusResponse,
} from '@/entities/ai-unlock/model/types'
import { AIUnlockRepository } from '../repositories/ai-unlock.repo'

const INSUFFICIENT_BALANCE_PATTERN = /^Insufficient credits/

const DAY_MS = 24 * 60 * 60 * 1000

@injectable()
export class AIUnlockService {
    constructor(
        @inject(AIUnlockRepository) private repo: AIUnlockRepository,
        @inject(SpendCreditsUseCase) private spendCredits: SpendCreditsUseCase,
    ) {}

    listProducts(): readonly AIUnlockProduct[] {
        return AI_UNLOCK_PRODUCTS
    }

    async getStatus(userId: string): Promise<AIUnlockStatusResponse> {
        const now = new Date()
        await this.repo.expireStale(userId, now)
        const active = await this.repo.findActiveForUser(userId, now)

        if (!active) {
            return { isActive: false, expiresAt: null }
        }

        return {
            isActive: true,
            expiresAt: active.expiresAt.toISOString(),
            durationDays: active.durationDays,
            startAt: active.startAt.toISOString(),
        }
    }

    async ensureActive(userId: string): Promise<void> {
        const status = await this.getStatus(userId)
        if (!status.isActive) {
            throw AppError.aiLockedError('AI features are locked. Purchase a pass to continue.')
        }
    }

    async purchase(userId: string, productId: string): Promise<AIUnlockPurchaseResponse> {
        const product = findAIUnlockProduct(productId)
        if (!product) {
            throw AppError.validationError('Invalid product id', [
                { field: 'productId', message: 'productId is not a valid AI unlock product' },
            ])
        }

        const now = new Date()
        await this.repo.expireStale(userId, now)
        const active = await this.repo.findActiveForUser(userId, now)

        // Stack: extend from current expiry if a pass is already active.
        const startAt = active ? active.expiresAt : now
        const expiresAt = new Date(startAt.getTime() + product.durationDays * DAY_MS)

        try {
            await this.spendCredits.execute({
                userId,
                amount: product.priceCoins,
                reason: `ai_unlock:${product.id}`,
            })
        } catch (error) {
            if (error instanceof Error && INSUFFICIENT_BALANCE_PATTERN.test(error.message)) {
                throw AppError.paymentRequiredError(error.message)
            }
            throw error
        }

        const created = await this.repo.create({
            userId,
            startAt,
            expiresAt,
            durationDays: product.durationDays,
            costCoins: product.priceCoins,
        })

        return {
            isActive: true,
            expiresAt: created.expiresAt.toISOString(),
            durationDays: created.durationDays,
            startAt: created.startAt.toISOString(),
        }
    }
}
