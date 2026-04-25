import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { ConversationsController } from '../controllers/conversations.controller'

const getController = (): ConversationsController => container.get(ConversationsController)

export const GET_CONVERSATIONS = asyncHandler(async (request: NextRequest) => {
    return getController().list(request)
})

export const GET_CONVERSATION_MESSAGES = asyncHandler(
    async (request: NextRequest, context?: { params?: Promise<Record<string, string>> }) => {
        const params = (await context?.params) ?? {}
        return getController().getMessages(request, params)
    },
)

export const POST_CONVERSATION_MESSAGE = asyncHandler(
    async (request: NextRequest, context?: { params?: Promise<Record<string, string>> }) => {
        const params = (await context?.params) ?? {}
        return getController().send(request, params)
    },
)

export const POST_CONVERSATION_READ = asyncHandler(
    async (request: NextRequest, context?: { params?: Promise<Record<string, string>> }) => {
        const params = (await context?.params) ?? {}
        return getController().markAsRead(request, params)
    },
)
