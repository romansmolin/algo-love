import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { AIUnlockController } from '../controllers/ai-unlock.controller'

const getController = (): AIUnlockController => container.get(AIUnlockController)

export const GET_AI_UNLOCK_STATUS = asyncHandler(async (request: NextRequest) => {
    return getController().getStatus(request)
})

export const GET_AI_UNLOCK_PRODUCTS = asyncHandler(async () => {
    return getController().listProducts()
})

export const POST_AI_UNLOCK_PURCHASE = asyncHandler(async (request: NextRequest) => {
    return getController().purchase(request)
})
