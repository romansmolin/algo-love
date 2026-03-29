/**
 * Credit domain types
 */

export type TransactionType = 'grant' | 'spend' | 'refund' | 'adjustment'
export type CreditTransactionStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED'

export interface UserCredits {
    id: string
    userId: string
    balance: number
    createdAt: Date
    updatedAt: Date
}

export interface CreditTransaction {
    id: string
    userId: string
    type: TransactionType
    amount: number
    status: CreditTransactionStatus
    reason: string | null
    paymentTokenId: string | null
    createdAt: Date
}

export interface CreateTransactionInput {
    userId: string
    type: TransactionType
    amount: number
    status?: CreditTransactionStatus
    reason?: string
    paymentTokenId?: string
}

export type CreditPricingMode = 'preset' | 'custom'
export type CreditPresetKey = 1 | 5 | 10

export interface PurchaseCreditsRequest {
    amountEur: number
    pricingMode?: CreditPricingMode
    presetKey?: CreditPresetKey
    consentAccepted: boolean
}

export interface PurchaseCreditsResponse {
    checkoutToken: string
    redirectUrl?: string
}

export interface WalletSummary {
    balance: number
    currency: string
    totalPurchased: number
    totalSpent: number
    pendingCredits: number
}

export interface WalletResponse {
    wallet: WalletSummary
    transactions: CreditTransaction[]
    total: number
}
