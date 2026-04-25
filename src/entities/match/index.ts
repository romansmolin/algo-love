export type {
    DiscoverMatchesResponse,
    InteractionDirection,
    InteractionItem,
    InteractionsResponse,
    MatchAction,
    MatchActionRequest,
    MatchActionResponse,
    MatchCandidate,
    MatchGender,
    MatchListResponse,
} from './model/types'

export {
    useDiscoverMatchesQuery,
    useGetMatchesQuery,
    useMatchActionMutation,
    useGetInteractionsQuery,
} from './api/client/endpoints'

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
export { MatchInteractionRepository } from './api/server/repositories/match-interaction.repo'
export { SubmitMatchActionUseCase } from './api/server/use-cases/submit-match-action.usecase'
export { ListInteractionsUseCase } from './api/server/use-cases/list-interactions.usecase'
export { InteractionsController } from './api/server/controllers/interactions.controller'
