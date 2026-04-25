import type { AIUnlockProduct } from './types'

export const AI_UNLOCK_PRODUCTS: readonly AIUnlockProduct[] = [
    {
        id: 'ai_unlock_1d',
        durationDays: 1,
        priceCoins: 50,
        title: 'Unlock AI for 1 day',
        description: 'Try every AI feature for 24 hours.',
    },
    {
        id: 'ai_unlock_3d',
        durationDays: 3,
        priceCoins: 120,
        title: 'Unlock AI for 3 days',
        description: 'Three days of full AI access.',
    },
    {
        id: 'ai_unlock_7d',
        durationDays: 7,
        priceCoins: 240,
        title: 'Unlock AI for 7 days',
        description: 'A full week of AI access at the best rate.',
    },
] as const

export const findAIUnlockProduct = (
    productId: string,
): AIUnlockProduct | undefined => {
    return AI_UNLOCK_PRODUCTS.find((product) => product.id === productId)
}
