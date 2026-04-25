import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { MatchRadarController } from '../controllers/match-radar.controller'

export const POST_AI_MATCH_RADAR = asyncHandler(async (request: NextRequest) => {
    const controller = container.get(MatchRadarController)
    return controller.analyze(request)
})
