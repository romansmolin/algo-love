import { api } from '@/shared/api/client/api'
import { normalizeError } from '@/shared/api/client/error-normalizer'
import {
    discoverMatches,
    getInteractions,
    getMatches,
    sendMatchAction,
    type DiscoverMatchesQuery,
    type InteractionsQuery,
} from './services/match.service'
import type {
    DiscoverMatchesResponse,
    InteractionsResponse,
    MatchActionRequest,
    MatchActionResponse,
    MatchListResponse,
} from '@/entities/match/model/types'

export const matchApi = api.injectEndpoints({
    endpoints: (builder) => ({
        discoverMatches: builder.query<DiscoverMatchesResponse, DiscoverMatchesQuery | void>({
            queryFn: async (query) => {
                try {
                    const data = await discoverMatches(query ?? {})
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
            providesTags: ['Discover'],
        }),
        getMatches: builder.query<MatchListResponse, void>({
            queryFn: async () => {
                try {
                    const data = await getMatches()
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
            providesTags: ['Match'],
        }),
        matchAction: builder.mutation<MatchActionResponse, MatchActionRequest>({
            queryFn: async (data) => {
                try {
                    const response = await sendMatchAction(data)
                    return { data: response }
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
            invalidatesTags: ['Match', 'Interactions'],
        }),
        getInteractions: builder.query<InteractionsResponse, InteractionsQuery>({
            queryFn: async (query) => {
                try {
                    const data = await getInteractions(query)
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
            providesTags: ['Interactions'],
        }),
    }),
})

export const {
    useDiscoverMatchesQuery,
    useGetMatchesQuery,
    useMatchActionMutation,
    useGetInteractionsQuery,
} = matchApi
