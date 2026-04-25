import { inject, injectable } from 'inversify'
import { AppError } from '@/shared/errors/app-error'
import type {
    DiscoverMatchesResponse,
    MatchCandidate,
    MatchGender,
    MatchListResponse,
} from '@/entities/match/model/types'
import {
    MatchRepository,
    type MatchListApiResponse,
    type MembreBlock,
    type PhotoBlock,
    type PhotoBlockV2,
    type SearchResponse,
} from '../repositories/match.repo'
import { MatchInteractionRepository } from '../repositories/match-interaction.repo'

type DiscoverFilters = {
    page?: number
    perPage?: number
    ageFrom?: number
    ageTo?: number
    sex?: '1' | '2' | '3'
    searchAction?: 'Last'
}

type CursorState = {
    legacyPage: number
}

const DEFAULT_LIMIT = 20
const UPSTREAM_BUFFER = 3 // pull this many ×limit from upstream so post-filter we still hit `limit`

const encodeCursor = (state: CursorState): string => {
    return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url')
}

const decodeCursor = (raw: string | null): CursorState | null => {
    if (!raw) return null

    try {
        const decoded = Buffer.from(raw, 'base64url').toString('utf8')
        const parsed = JSON.parse(decoded) as CursorState
        if (typeof parsed?.legacyPage === 'number' && parsed.legacyPage >= 0) {
            return parsed
        }
    } catch {
        // fall through
    }

    throw AppError.validationError('Invalid cursor', [
        { field: 'cursor', message: 'cursor is malformed' },
    ])
}

const toNumber = (value?: number | string): number | undefined => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return undefined

        const parsed = Number(trimmed)
        return Number.isFinite(parsed) ? parsed : undefined
    }

    return undefined
}

const toInteger = (value?: number | string): number | undefined => {
    const parsed = toNumber(value)
    if (parsed === undefined || !Number.isInteger(parsed)) {
        return undefined
    }

    return parsed
}

const toPositiveInteger = (value?: number | string): number | undefined => {
    const parsed = toInteger(value)

    if (parsed === undefined || parsed < 1) {
        return undefined
    }

    return parsed
}

const toNonNegativeInteger = (value?: number | string): number | undefined => {
    const parsed = toInteger(value)

    if (parsed === undefined || parsed < 0) {
        return undefined
    }

    return parsed
}

const normalizeText = (value?: string): string | undefined => {
    if (!value) return undefined

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
}

const mapGender = (value?: number | string): MatchGender | undefined => {
    const genderValue = toInteger(value)

    if (genderValue === 1) return 'man'
    if (genderValue === 2) return 'woman'
    if (genderValue === 3) return 'couple'
    return undefined
}

const mapDiscoverGenderToSex = (value: string): '1' | '2' | '3' => {
    if (value === 'men') return '1'
    if (value === 'women') return '2'
    return '3'
}

const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

const isMembreBlockArray = (value: unknown): value is MembreBlock[] => {
    return Array.isArray(value)
}

const getPhotoFromV2 = (photo?: PhotoBlockV2): string | undefined => {
    if (!photo) return undefined

    return (
        normalizeText(photo.sq_430) ??
        normalizeText(photo.sq_middle) ??
        normalizeText(photo.sq_small) ??
        normalizeText(photo.normal)
    )
}

const getPhotoFromLegacy = (photo?: PhotoBlock): string | undefined => {
    if (!photo) return undefined

    return (
        normalizeText(photo.url_middle) ??
        normalizeText(photo.url_small) ??
        normalizeText(photo.url_big)
    )
}

const getPhotoUrl = (member: MembreBlock): string | undefined => {
    const photoV2 = getPhotoFromV2(member.photos_v2?.[0])
    if (photoV2) return photoV2

    return getPhotoFromLegacy(member.photos?.[0])
}

const getPhotoCount = (member: MembreBlock): number | undefined => {
    const fromV2 = member.photos_v2?.length
    const fromLegacy = member.photos?.length

    if (fromV2 && fromV2 > 0) return fromV2
    if (fromLegacy && fromLegacy > 0) return fromLegacy

    return toPositiveInteger(member.photo)
}

const toMatchCandidate = (member: MembreBlock): MatchCandidate | null => {
    const id = toPositiveInteger(member.id)

    if (!id) {
        return null
    }

    const username = normalizeText(member.pseudo) ?? normalizeText(member.prenom) ?? 'Member'

    const candidate: MatchCandidate = {
        id,
        username,
        gender: mapGender(member.sexe1),
        photoUrl: getPhotoUrl(member),
        photoCount: getPhotoCount(member),
    }

    const age = toPositiveInteger(member.age)
    if (age !== undefined) {
        candidate.age = age
    }

    const location = normalizeText(member.zone_name)
    if (location) {
        candidate.location = location
    }

    const rating = toNumber(member.moyenne)
    if (rating !== undefined) {
        candidate.rating = rating
    }

    return candidate
}

const extractItemsFromMatchListPayload = (payload: MatchListApiResponse): MembreBlock[] => {
    if (isMembreBlockArray(payload)) {
        return payload
    }

    if (!isObject(payload)) {
        return []
    }

    if (isMembreBlockArray(payload.tab_profils)) {
        return payload.tab_profils
    }

    if (isMembreBlockArray(payload.result)) {
        return payload.result
    }

    if (isObject(payload.result) && isMembreBlockArray(payload.result.tab_profils)) {
        return payload.result.tab_profils
    }

    return []
}

const extractTotalFromMatchListPayload = (
    payload: MatchListApiResponse,
    fallbackCount: number,
): number => {
    if (!isObject(payload)) {
        return fallbackCount
    }

    const topLevelTotal = toPositiveInteger(payload.nb_total as number | string | undefined)
    if (topLevelTotal !== undefined) {
        return topLevelTotal
    }

    if (isObject(payload.result)) {
        const nestedTotal = toPositiveInteger(payload.result.nb_total as number | string | undefined)
        if (nestedTotal !== undefined) {
            return nestedTotal
        }
    }

    return fallbackCount
}

const ensureConnectedForDiscover = (payload: SearchResponse): void => {
    if (toInteger(payload.connected) === 0) {
        throw AppError.authenticationError('Session expired')
    }
}

const ensureConnectedForMatchList = (payload: MatchListApiResponse): void => {
    if (isObject(payload) && toInteger(payload.connected as number | string | undefined) === 0) {
        throw AppError.authenticationError('Session expired')
    }
}

const parseDiscoverPage = (value: string | null): number | undefined => {
    if (!value) return undefined

    const page = Number.parseInt(value, 10)
    if (!Number.isFinite(page) || page < 0) {
        throw AppError.validationError('Invalid page query parameter', [
            { field: 'page', message: 'page must be a non-negative integer' },
        ])
    }

    return page
}

const parsePositiveQueryInteger = (value: string | null, field: string): number | undefined => {
    if (!value) return undefined

    const parsed = Number.parseInt(value, 10)

    if (!Number.isFinite(parsed) || parsed < 1) {
        throw AppError.validationError(`Invalid ${field} query parameter`, [
            { field, message: `${field} must be a positive integer` },
        ])
    }

    return parsed
}

type DiscoverQuery = {
    filters: DiscoverFilters
    cursor: CursorState | null
    limit: number
}

const parseLimit = (value: string | null): number => {
    if (!value) return DEFAULT_LIMIT

    const parsed = Number.parseInt(value, 10)

    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100) {
        throw AppError.validationError('Invalid limit query parameter', [
            { field: 'limit', message: 'limit must be between 1 and 100' },
        ])
    }

    return parsed
}

const getDiscoverFilters = (searchParams: URLSearchParams): DiscoverFilters => {
    const page = parseDiscoverPage(searchParams.get('page'))
    const perPage = parsePositiveQueryInteger(searchParams.get('perPage'), 'perPage')
    const ageFrom = parsePositiveQueryInteger(searchParams.get('ageFrom'), 'ageFrom')
    const ageTo = parsePositiveQueryInteger(searchParams.get('ageTo'), 'ageTo')

    if (ageFrom && ageTo && ageFrom > ageTo) {
        throw AppError.validationError('Invalid age range', [
            { field: 'ageFrom', message: 'ageFrom must be less than or equal to ageTo' },
        ])
    }

    const gender = searchParams.get('gender')

    let sex: '1' | '2' | '3' | undefined
    if (gender != null) {
        if (gender !== 'men' && gender !== 'women' && gender !== 'couple') {
            throw AppError.validationError('Invalid gender query parameter', [
                { field: 'gender', message: 'gender must be one of: men, women, couple' },
            ])
        }

        sex = mapDiscoverGenderToSex(gender)
    }

    const hasExplicitFilters = sex !== undefined || ageFrom !== undefined || ageTo !== undefined

    return {
        page,
        perPage,
        ageFrom,
        ageTo,
        sex,
        searchAction: hasExplicitFilters ? undefined : 'Last',
    }
}

const getDiscoverQuery = (searchParams: URLSearchParams): DiscoverQuery => {
    const filters = getDiscoverFilters(searchParams)
    const cursor = decodeCursor(searchParams.get('cursor'))
    const limit = parseLimit(searchParams.get('limit'))

    return { filters, cursor, limit }
}

@injectable()
export class MatchService {
    constructor(
        @inject(MatchRepository) private repository: MatchRepository,
        @inject(MatchInteractionRepository)
        private interactionRepo: MatchInteractionRepository,
    ) {}

    async discoverMatches(
        sessionId: string,
        appUserId: string,
        searchParams: URLSearchParams,
    ): Promise<DiscoverMatchesResponse> {
        const { filters, cursor, limit } = getDiscoverQuery(searchParams)

        // Cursor takes precedence over the legacy `page` query param so
        // pagination is dupe-free across refreshes and devices.
        const legacyPage = cursor?.legacyPage ?? filters.page ?? 0

        const payload = await this.repository.discoverMatches({
            sessionId,
            page: legacyPage,
            perPage: filters.perPage ?? limit * UPSTREAM_BUFFER,
            ageFrom: filters.ageFrom,
            ageTo: filters.ageTo,
            sex: filters.sex,
            searchAction: filters.searchAction,
        })

        ensureConnectedForDiscover(payload)

        const actedTargetIds = await this.interactionRepo.listActedTargetIds(appUserId)

        const filtered = (payload.result ?? [])
            .map(toMatchCandidate)
            .filter((item): item is MatchCandidate => item != null && !actedTargetIds.has(item.id))
            .slice(0, limit)

        const upstreamHasMore =
            (payload.result ?? []).length > 0 &&
            (toPositiveInteger(payload.nb_pages) ?? legacyPage + 2) > legacyPage + 1

        const nextCursor =
            filtered.length === limit && upstreamHasMore
                ? encodeCursor({ legacyPage: legacyPage + 1 })
                : null

        return {
            items: filtered,
            nextCursor,
            page: legacyPage,
            totalPages: toPositiveInteger(payload.nb_pages),
            total: toNonNegativeInteger(payload.total) ?? filtered.length,
        }
    }

    async listMatches(sessionId: string): Promise<MatchListResponse> {
        const payload = await this.repository.listMatches(sessionId)

        ensureConnectedForMatchList(payload)

        const rawItems = extractItemsFromMatchListPayload(payload)
        const items = rawItems
            .map(toMatchCandidate)
            .filter((item): item is MatchCandidate => item != null)

        return {
            items,
            total: extractTotalFromMatchListPayload(payload, items.length),
        }
    }
}
