export interface AIUnlockProduct {
    id: 'ai_unlock_1d' | 'ai_unlock_3d' | 'ai_unlock_7d'
    durationDays: number
    priceCoins: number
    title: string
    description: string
}

export interface AIUnlockStatusResponse {
    isActive: boolean
    expiresAt: string | null
    durationDays?: number
    startAt?: string | null
}

export interface AIUnlockProductsResponse {
    products: AIUnlockProduct[]
}

export interface AIUnlockPurchaseRequest {
    productId: AIUnlockProduct['id']
}

export interface AIUnlockPurchaseResponse {
    isActive: true
    expiresAt: string
    durationDays: number
    startAt: string
}
