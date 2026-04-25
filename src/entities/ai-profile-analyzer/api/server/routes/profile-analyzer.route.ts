import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { ProfileAnalyzerController } from '../controllers/profile-analyzer.controller'

export const POST_AI_PROFILE_ANALYZER = asyncHandler(async (request: NextRequest) => {
    const controller = container.get(ProfileAnalyzerController)
    return controller.analyze(request)
})
