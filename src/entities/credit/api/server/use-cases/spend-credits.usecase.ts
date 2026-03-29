import 'server-only'
import { injectable, inject } from 'inversify'
import type { ICreditRepository } from '../interfaces/credit-repository.interface'
import type { CreditTransaction } from '../../../model/types'

export interface SpendCreditsInput {
    userId: string
    amount: number
    reason: string
}

/**
 * Use case for spending credits
 * Checks balance, deducts credits, and creates a transaction
 */
@injectable()
export class SpendCreditsUseCase {
    constructor(@inject('ICreditRepository') private repository: ICreditRepository) {}

    async execute(input: SpendCreditsInput): Promise<CreditTransaction> {
        // Get current balance
        const credits = await this.repository.getOrCreateBalance(input.userId)

        // Check if user has enough credits
        if (credits.balance < input.amount) {
            throw new Error(
                `Insufficient credits. You have ${credits.balance} credits but need ${input.amount}.`,
            )
        }

        // Calculate new balance
        const newBalance = credits.balance - input.amount

        // Update balance
        await this.repository.updateBalance(input.userId, newBalance)

        // Create transaction record
        const transaction = await this.repository.createTransaction({
            userId: input.userId,
            type: 'spend',
            amount: -input.amount, // Negative for spending
            status: 'SUCCESSFUL',
            reason: input.reason,
        })

        return transaction
    }
}
