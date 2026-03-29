import { injectable } from 'inversify'
import { prisma } from '@/shared/lib/database/prisma'
import { ICreditRepository } from '../interfaces/credit-repository.interface'
import type { UserCredits, CreditTransaction, CreateTransactionInput } from '../../../model/types'

type UserCreditsRow = NonNullable<Awaited<ReturnType<typeof prisma.user_credits.findUnique>>>
type CreditTransactionRow = NonNullable<
    Awaited<ReturnType<typeof prisma.credit_transaction.findUnique>>
>

@injectable()
export class PrismaCreditRepository implements ICreditRepository {
    async getOrCreateBalance(userId: string): Promise<UserCredits> {
        let credits = await prisma.user_credits.findUnique({
            where: { userId },
        })

        if (!credits) {
            credits = await prisma.user_credits.create({
                data: {
                    id: crypto.randomUUID(),
                    userId,
                    balance: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            })
        }

        return this.mapToUserCredits(credits)
    }

    async updateBalance(userId: string, newBalance: number): Promise<UserCredits> {
        const credits = await prisma.user_credits.update({
            where: { userId },
            data: {
                balance: newBalance,
                updatedAt: new Date(),
            },
        })

        return this.mapToUserCredits(credits)
    }

    async createTransaction(input: CreateTransactionInput): Promise<CreditTransaction> {
        const transaction = await prisma.credit_transaction.create({
            data: {
                id: crypto.randomUUID(),
                userId: input.userId,
                type: input.type,
                amount: input.amount,
                status: input.status ?? 'SUCCESSFUL',
                reason: input.reason || null,
                paymentTokenId: input.paymentTokenId || null,
                createdAt: new Date(),
            },
        })

        return this.mapToTransaction(transaction)
    }

    async getTransactions(userId: string, limit?: number): Promise<CreditTransaction[]> {
        const transactions = await prisma.credit_transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            ...(typeof limit === 'number' ? { take: limit } : {}),
        })

        return transactions.map(this.mapToTransaction)
    }

    async findTransactionByPaymentTokenId(
        paymentTokenId: string,
    ): Promise<CreditTransaction | null> {
        const transaction = await prisma.credit_transaction.findUnique({
            where: { paymentTokenId },
        })

        return transaction ? this.mapToTransaction(transaction) : null
    }

    async updateTransactionStatus(
        transactionId: string,
        status: CreditTransaction['status'],
    ): Promise<CreditTransaction> {
        const transaction = await prisma.credit_transaction.update({
            where: { id: transactionId },
            data: {
                status,
            },
        })

        return this.mapToTransaction(transaction)
    }

    private mapToUserCredits(data: UserCreditsRow): UserCredits {
        return {
            id: data.id,
            userId: data.userId,
            balance: data.balance,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        }
    }

    private mapToTransaction(data: CreditTransactionRow): CreditTransaction {
        return {
            id: data.id,
            userId: data.userId,
            type: data.type,
            amount: data.amount,
            status: data.status,
            reason: data.reason,
            paymentTokenId: data.paymentTokenId,
            createdAt: data.createdAt,
        }
    }
}
