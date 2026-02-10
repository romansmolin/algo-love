import { inject, injectable } from 'inversify'
import { AppError } from '@/shared/errors/app-error'
import type {
    DiscoverMatchesResponse,
    MatchAction,
    MatchActionResponse,
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

type DiscoverFilters = {
    page?: number
    perPage?: number
    ageFrom?: number
    ageTo?: number
    sex?: '1' | '2' | '3'
    searchAction?: 'Last'
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

@injectable()
export class MatchService {
    constructor(@inject(MatchRepository) private repository: MatchRepository) {}

    async discoverMatches(
        sessionId: string,
        searchParams: URLSearchParams,
    ): Promise<DiscoverMatchesResponse> {
        const filters = getDiscoverFilters(searchParams)

        const payload = await this.repository.discoverMatches({
            sessionId,
            page: filters.page,
            perPage: filters.perPage,
            ageFrom: filters.ageFrom,
            ageTo: filters.ageTo,
            sex: filters.sex,
            searchAction: filters.searchAction,
        })

        ensureConnectedForDiscover(payload)

        const items = (payload.result ?? [])
            .map(toMatchCandidate)
            .filter((item): item is MatchCandidate => item != null)

        return {
            items,
            page: filters.page,
            totalPages: toPositiveInteger(payload.nb_pages),
            total: toNonNegativeInteger(payload.total) ?? items.length,
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

    async submitAction(
        sessionId: string,
        userId: number,
        action: MatchAction,
    ): Promise<MatchActionResponse> {
        const response =
            action === 'like'
                ? await this.repository.setLike(sessionId, userId)
                : await this.repository.setDislike(sessionId, userId)

        return {
            result: response.result,
            isMatch: response.result === 'match',
        }
    }
}
