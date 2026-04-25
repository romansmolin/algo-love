import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { BioRewriteStudioController } from '../controllers/bio-rewrite-studio.controller'

export const POST_AI_BIO_REWRITE_STUDIO = asyncHandler(async (request: NextRequest) => {
    const controller = container.get(BioRewriteStudioController)
    return controller.rewrite(request)
})
