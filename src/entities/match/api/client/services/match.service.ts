import { apiClient } from '@/shared/api/client/axios.config'
import type {
    DiscoverMatchesResponse,
    MatchActionRequest,
    MatchActionResponse,
    MatchListResponse,
} from '@/entities/match/model/types'

export type DiscoverMatchesQuery = {
    page?: number
    perPage?: number
    gender?: 'men' | 'women' | 'couple'
    ageFrom?: number
    ageTo?: number
}

const toDiscoverQueryString = (query: DiscoverMatchesQuery): string => {
    const params = new URLSearchParams()

    if (typeof query.page === 'number') {
        params.set('page', String(query.page))
    }

    if (typeof query.perPage === 'number') {
        params.set('perPage', String(query.perPage))
    }

    if (query.gender) {
        params.set('gender', query.gender)
    }

    if (typeof query.ageFrom === 'number') {
        params.set('ageFrom', String(query.ageFrom))
    }

    if (typeof query.ageTo === 'number') {
        params.set('ageTo', String(query.ageTo))
    }

    return params.toString()
}

export async function discoverMatches(
    query: DiscoverMatchesQuery = {},
): Promise<DiscoverMatchesResponse> {
    const queryString = toDiscoverQueryString(query)
    const path = queryString ? `/api/match/discover?${queryString}` : '/api/match/discover'

    const response = await apiClient.get<DiscoverMatchesResponse>(path)
    return response.data
}

export async function getMatches(): Promise<MatchListResponse> {
    const response = await apiClient.get<MatchListResponse>('/api/match/list')
    return response.data
}

export async function sendMatchAction(data: MatchActionRequest): Promise<MatchActionResponse> {
    const response = await apiClient.post<MatchActionResponse>('/api/match/action', data)
    return response.data
}
