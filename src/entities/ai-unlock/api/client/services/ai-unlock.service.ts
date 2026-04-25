import { apiClient } from '@/shared/api/client/axios.config'
import type {
    AIUnlockProductsResponse,
    AIUnlockPurchaseRequest,
    AIUnlockPurchaseResponse,
    AIUnlockStatusResponse,
} from '@/entities/ai-unlock/model/types'

export async function getAIUnlockStatus(): Promise<AIUnlockStatusResponse> {
    const response = await apiClient.get<AIUnlockStatusResponse>('/api/ai/unlock-status')
    return response.data
}

export async function getAIUnlockProducts(): Promise<AIUnlockProductsResponse> {
    const response = await apiClient.get<AIUnlockProductsResponse>('/api/ai/unlock/products')
    return response.data
}

export async function purchaseAIUnlock(
    payload: AIUnlockPurchaseRequest,
): Promise<AIUnlockPurchaseResponse> {
    const response = await apiClient.post<AIUnlockPurchaseResponse>(
        '/api/ai/unlock/purchase',
        payload,
    )
    return response.data
}
