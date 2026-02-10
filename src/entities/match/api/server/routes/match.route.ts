import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { MatchController } from '@/entities/match'

const getMatchController = (): MatchController => {
    return container.get(MatchController)
}

export const GET_MATCH_DISCOVER = asyncHandler(async (request: NextRequest) => {
    return getMatchController().discoverMatches(request)
})

export const GET_MATCH_LIST = asyncHandler(async (request: NextRequest) => {
    return getMatchController().listMatches(request)
})

export const POST_MATCH_ACTION = asyncHandler(async (request: NextRequest) => {
    return getMatchController().submitAction(request)
})
