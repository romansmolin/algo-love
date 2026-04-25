'use client'

import { useGetAIUnlockStatusQuery } from '@/entities/ai-unlock'

export type UseAIUnlockResult = {
    isActive: boolean
    expiresAt: string | null
    durationDays?: number
    startAt?: string | null
    isLoading: boolean
    refetch: ReturnType<typeof useGetAIUnlockStatusQuery>['refetch']
}

export const useAIUnlock = (): UseAIUnlockResult => {
    const query = useGetAIUnlockStatusQuery(undefined, {
        refetchOnFocus: true,
        refetchOnReconnect: true,
        refetchOnMountOrArgChange: true,
    })

    const status = query.data
    return {
        isActive: status?.isActive ?? false,
        expiresAt: status?.expiresAt ?? null,
        durationDays: status?.durationDays,
        startAt: status?.startAt ?? null,
        isLoading: query.isLoading,
        refetch: query.refetch,
    }
}
