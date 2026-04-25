import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { GetUserDetailsController } from '../controller/get-user-details.controller'

const getController = (): GetUserDetailsController => {
    return container.get(GetUserDetailsController)
}

export const GET_USER_DETAILS = asyncHandler(
    async (request: NextRequest, context?: { params?: Promise<Record<string, string>> }) => {
        const params = (await context?.params) ?? {}
        return getController().getDetails(request, params)
    },
)
