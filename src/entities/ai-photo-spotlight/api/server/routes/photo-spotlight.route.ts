import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { PhotoSpotlightController } from '../controllers/photo-spotlight.controller'

export const POST_AI_PHOTO_SPOTLIGHT = asyncHandler(async (request: NextRequest) => {
    const controller = container.get(PhotoSpotlightController)
    return controller.analyze(request)
})
