import 'server-only'

import { injectable } from 'inversify'
import { HttpError } from '@/shared/errors/http-error'
import { getEnvVar } from '@/shared/utils/get-env-var'

type QueryValue = string | number | undefined

type QueryParams = Record<string, QueryValue>

export type PhotoBlock = {
    url_middle?: string
    url_small?: string
    url_big?: string
}

export type PhotoBlockV2 = {
    normal?: string
    sq_430?: string
    sq_middle?: string
    sq_small?: string
}

export type MembreBlock = {
    id?: number | string
    pseudo?: string
    prenom?: string
    sexe1?: number | string
    age?: number | string
    zone_name?: string
    moyenne?: number | string
    photo?: number | string
    photos?: PhotoBlock[]
    photos_v2?: PhotoBlockV2[]
}

export type SearchResponse = {
    connected?: number | string
    nb_pages?: number | string
    total?: number | string
    result?: MembreBlock[]
}

export type MatchListApiResponse =
    | {
          connected?: number | string
          result?: MembreBlock[] | { nb_total?: number | string; tab_profils?: MembreBlock[] }
          tab_profils?: MembreBlock[]
          nb_total?: number | string
      }
    | MembreBlock[]

export type MatchActionApiResponse = {
    result?: string
}

type DiscoverParams = {
    sessionId: string
    page?: number
    perPage?: number
    ageFrom?: number
    ageTo?: number
    sex?: '1' | '2' | '3'
    searchAction?: 'Last'
}

const API_BASE_URL = getEnvVar('DATING_EXTERNAL_API_URL')
const API_KEY = getEnvVar('DATING_EXTERNAL_API_KEY')

const cleanParams = (params: QueryParams): QueryParams => {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
    )
}

const maskValue = (value?: string): string | undefined => {
    if (!value) return undefined
    if (value.length <= 6) return '***'
    return `${value.slice(0, 3)}***${value.slice(-3)}`
}

const sanitizeParams = (params: QueryParams): QueryParams => {
    const sanitized: QueryParams = { ...params }

    if (typeof sanitized.session_id === 'string') {
        sanitized.session_id = maskValue(sanitized.session_id)
    }

    if (typeof sanitized.api_key === 'string') {
        sanitized.api_key = '***'
    }

    return sanitized
}

const toStatusCode = (status: number): number => {
    return status >= 400 && status < 500 ? 400 : 502
}

const buildUrl = (path: string, params: QueryParams): URL => {
    const url = new URL(path, API_BASE_URL)

    for (const [key, value] of Object.entries(cleanParams(params))) {
        url.searchParams.set(key, String(value))
    }

    return url
}

const parseJsonResponse = async <T>(response: Response, path: string): Promise<T> => {
    const responseForDebug = response.clone()

    try {
        return (await response.json()) as T
    } catch {
        let preview = ''

        try {
            preview = (await responseForDebug.text()).slice(0, 300)
        } catch {
            preview = '[unavailable]'
        }

        console.error('[MatchRepository] Failed to parse upstream JSON', {
            path,
            status: response.status,
            preview,
        })

        throw new HttpError('Match upstream returned invalid JSON', 502)
    }
}

const requestGet = async <T>(path: string, params: QueryParams): Promise<T> => {
    const url = buildUrl(path, params)
    const sanitizedParams = sanitizeParams(params)

    console.info('[MatchRepository] GET upstream request', {
        path,
        params: sanitizedParams,
    })

    let response: Response
    try {
        response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        })
    } catch (error) {
        console.error('[MatchRepository] GET upstream network error', {
            path,
            params: sanitizedParams,
            error,
        })
        throw new HttpError('Match upstream service unavailable', 502)
    }

    const payload = await parseJsonResponse<T & { error?: string }>(response, path)

    console.info('[MatchRepository] GET upstream response', {
        path,
        status: response.status,
        ok: response.ok,
    })

    if (!response.ok) {
        console.error('[MatchRepository] GET upstream non-ok response', {
            path,
            status: response.status,
            payload,
        })

        throw new HttpError(
            payload.error ?? 'Match upstream request failed',
            toStatusCode(response.status),
        )
    }

    return payload
}

const requestPost = async <T>(path: string, params: QueryParams): Promise<T> => {
    const url = new URL(path, API_BASE_URL)
    const bodyParams = new URLSearchParams()
    const sanitizedParams = sanitizeParams(params)
    const cleanedParams = cleanParams(params)

    console.info('[MatchRepository] POST upstream request', {
        path,
        params: sanitizedParams,
    })

    for (const [key, value] of Object.entries(cleanedParams)) {
        // Upstream accepts POST with query semantics; we send both query and body.
        url.searchParams.set(key, String(value))
        bodyParams.set(key, String(value))
    }

    let response: Response
    try {
        response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams.toString(),
            cache: 'no-store',
        })
    } catch (error) {
        console.error('[MatchRepository] POST upstream network error', {
            path,
            params: sanitizedParams,
            error,
        })
        throw new HttpError('Match upstream service unavailable', 502)
    }

    const payload = await parseJsonResponse<T & { error?: string }>(response, path)

    console.info('[MatchRepository] POST upstream response', {
        path,
        status: response.status,
        ok: response.ok,
    })

    if (!response.ok) {
        console.error('[MatchRepository] POST upstream non-ok response', {
            path,
            status: response.status,
            payload,
        })

        throw new HttpError(
            payload.error ?? 'Match upstream request failed',
            toStatusCode(response.status),
        )
    }

    return payload
}

@injectable()
export class MatchRepository {
    async discoverMatches(params: DiscoverParams): Promise<SearchResponse> {
        return requestPost<SearchResponse>('/index_api/search', {
            session_id: params.sessionId,
            api_key: API_KEY,
            page: params.page,
            pas: params.perPage,
            age_from: params.ageFrom,
            age_to: params.ageTo,
            sex: params.sex,
            get_picture_430: 1,
            searchAction: params.searchAction,
        })
    }

    async listMatches(sessionId: string): Promise<MatchListApiResponse> {
        return requestGet<MatchListApiResponse>('/index_api/match', {
            session_id: sessionId,
            api_key: API_KEY,
            action: 'get_matches',
        })
    }

    async setLike(sessionId: string, userId: number): Promise<MatchActionApiResponse> {
        return requestGet<MatchActionApiResponse>('/index_api/match', {
            session_id: sessionId,
            api_key: API_KEY,
            action: 'set_like',
            id_user: userId,
        })
    }

    async setDislike(sessionId: string, userId: number): Promise<MatchActionApiResponse> {
        return requestGet<MatchActionApiResponse>('/index_api/match', {
            session_id: sessionId,
            api_key: API_KEY,
            action: 'set_dislike',
            id_user: userId,
        })
    }
}
