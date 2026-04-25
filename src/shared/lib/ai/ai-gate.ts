import 'server-only'

import { inject, injectable } from 'inversify'
import type { AiFeatureKey, Prisma } from '@prisma/client'
import { AppError } from '@/shared/errors/app-error'
import { prisma } from '@/shared/lib/database/prisma'
import { SpendCreditsUseCase } from '@/entities/credit/api/server/use-cases/spend-credits.usecase'
import { AI_FEATURE_CONFIG } from './ai-pricing'
import { computeInputHash, floorToMinute } from './ai-cache'

export type AIGateExecuteResult<T> = {
    output: T
    usage: { promptTokens: number; completionTokens: number }
}

export type AIGateInput<T> = {
    userId: string
    feature: AiFeatureKey
    subjectKey: string
    cacheInput: unknown
    execute: () => Promise<AIGateExecuteResult<T>>
}

export type AIGateResult<T> = {
    output: T
    cached: boolean
    costCoins: number
}

const INSUFFICIENT_BALANCE_PATTERN = /^Insufficient credits/

@injectable()
export class AIGate {
    constructor(@inject(SpendCreditsUseCase) private spendCredits: SpendCreditsUseCase) {}

    async run<T>(input: AIGateInput<T>): Promise<AIGateResult<T>> {
        const config = AI_FEATURE_CONFIG[input.feature]
        const inputHash = computeInputHash(input.cacheInput)
        const now = new Date()

        // 1. Cache lookup (skip rate-limit + credits on hit).
        if (config.cacheTtlSeconds != null) {
            const cached = await prisma.ai_analysis.findUnique({
                where: {
                    userId_feature_subjectKey_inputHash: {
                        userId: input.userId,
                        feature: input.feature,
                        subjectKey: input.subjectKey,
                        inputHash,
                    },
                },
            })

            if (cached && (!cached.expiresAt || cached.expiresAt.getTime() > now.getTime())) {
                return {
                    output: cached.output as T,
                    cached: true,
                    costCoins: cached.costCoins,
                }
            }
        }

        // 2. Rate limit (sliding 1-minute bucket).
        const windowAt = floorToMinute(now)
        const bucket = await prisma.ai_rate_bucket.upsert({
            where: {
                userId_feature_windowAt: {
                    userId: input.userId,
                    feature: input.feature,
                    windowAt,
                },
            },
            update: { count: { increment: 1 } },
            create: {
                userId: input.userId,
                feature: input.feature,
                windowAt,
                count: 1,
            },
        })

        if (bucket.count > config.rateLimitPerMinute) {
            throw AppError.rateLimitedError(
                `Too many ${input.feature} requests — try again in a minute.`,
            )
        }

        // 3. Credit debit.
        try {
            await this.spendCredits.execute({
                userId: input.userId,
                amount: config.costCoins,
                reason: `ai:${input.feature}`,
            })
        } catch (error) {
            if (error instanceof Error && INSUFFICIENT_BALANCE_PATTERN.test(error.message)) {
                throw AppError.paymentRequiredError(error.message)
            }
            throw error
        }

        // 4. Execute.
        const { output, usage } = await input.execute()

        // 5. Persist.
        const expiresAt =
            config.cacheTtlSeconds != null
                ? new Date(Date.now() + config.cacheTtlSeconds * 1000)
                : null

        const data = {
            userId: input.userId,
            feature: input.feature,
            subjectKey: input.subjectKey,
            inputHash,
            output: output as Prisma.InputJsonValue,
            tokensIn: usage.promptTokens,
            tokensOut: usage.completionTokens,
            costCoins: config.costCoins,
            expiresAt,
        }

        await prisma.ai_analysis.upsert({
            where: {
                userId_feature_subjectKey_inputHash: {
                    userId: input.userId,
                    feature: input.feature,
                    subjectKey: input.subjectKey,
                    inputHash,
                },
            },
            update: {
                output: data.output,
                tokensIn: data.tokensIn,
                tokensOut: data.tokensOut,
                costCoins: data.costCoins,
                expiresAt: data.expiresAt,
            },
            create: data,
        })

        return { output, cached: false, costCoins: config.costCoins }
    }
}
