export type {
    DiscoverMatchesResponse,
    MatchAction,
    MatchActionRequest,
    MatchActionResponse,
    MatchCandidate,
    MatchGender,
    MatchListResponse,
} from './model/types'

export { useDiscoverMatchesQuery, useGetMatchesQuery, useMatchActionMutation } from './api/client/endpoints'

export type { DiscoverMatchesQuery } from './api/client/services/match.service'

export { MatchController } from './api/server/controllers/match.controller'
export { MatchService } from './api/server/services/match.service'
export {
    MatchRepository,
    type MatchActionApiResponse,
    type MatchListApiResponse,
    type MembreBlock,
    type PhotoBlock,
    type PhotoBlockV2,
    type SearchResponse,
} from './api/server/repositories/match.repo'
