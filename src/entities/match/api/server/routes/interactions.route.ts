import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { InteractionsController } from '../controllers/interactions.controller'

const getController = (): InteractionsController => container.get(InteractionsController)

export const GET_INTERACTIONS = asyncHandler(async (request: NextRequest) => {
    return getController().list(request)
})
