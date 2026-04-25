import { api } from '@/shared/api/client/api'
import { normalizeError } from '@/shared/api/client/error-normalizer'
import {
    getAIUnlockProducts,
    getAIUnlockStatus,
    purchaseAIUnlock,
} from './services/ai-unlock.service'
import type {
    AIUnlockProductsResponse,
    AIUnlockPurchaseRequest,
    AIUnlockPurchaseResponse,
    AIUnlockStatusResponse,
} from '@/entities/ai-unlock/model/types'

export const aiUnlockApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAIUnlockStatus: builder.query<AIUnlockStatusResponse, void>({
            queryFn: async () => {
                try {
                    const data = await getAIUnlockStatus()
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: ['AIUnlock'],
        }),
        getAIUnlockProducts: builder.query<AIUnlockProductsResponse, void>({
            queryFn: async () => {
                try {
                    const data = await getAIUnlockProducts()
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: ['AIUnlock'],
        }),
        purchaseAIUnlock: builder.mutation<AIUnlockPurchaseResponse, AIUnlockPurchaseRequest>({
            queryFn: async (payload) => {
                try {
                    const data = await purchaseAIUnlock(payload)
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            invalidatesTags: ['AIUnlock', 'Wallet'],
        }),
    }),
})

export const {
    useGetAIUnlockStatusQuery,
    useGetAIUnlockProductsQuery,
    usePurchaseAIUnlockMutation,
} = aiUnlockApi
