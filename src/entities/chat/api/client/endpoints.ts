import { api } from '@/shared/api/client/api'
import { normalizeError } from '@/shared/api/client/error-normalizer'
import {
    getChatContacts,
    getChatMessages,
    sendChatMessage,
    getConversations,
    getConversationMessages,
    sendConversationMessage,
    markConversationRead,
    type GetChatMessagesQuery,
    type GetConversationMessagesQuery,
    type SendConversationMessagePayload,
} from './services/chat.service'
import type {
    ContactsResponse,
    ConversationMessagesResponse,
    ConversationsListResponse,
    MarkConversationReadResponse,
    MessagesResponse,
    SendConversationMessageResponse,
    SendMessageRequest,
    SendMessageResponse,
} from '@/entities/chat/model/types'

export const chatApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getChatContacts: builder.query<ContactsResponse, void>({
            queryFn: async () => {
                try {
                    const data = await getChatContacts()
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: ['Chat'],
        }),
        getChatMessages: builder.query<MessagesResponse, GetChatMessagesQuery>({
            queryFn: async (query) => {
                try {
                    const data = await getChatMessages(query)
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: ['Chat'],
        }),
        sendChatMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
            queryFn: async (payload) => {
                try {
                    const data = await sendChatMessage(payload)
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            invalidatesTags: ['Chat'],
        }),
        getConversations: builder.query<ConversationsListResponse, void>({
            queryFn: async () => {
                try {
                    const data = await getConversations()
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: ['Chat'],
        }),
        getConversationMessages: builder.query<
            ConversationMessagesResponse,
            GetConversationMessagesQuery
        >({
            queryFn: async (query) => {
                try {
                    const data = await getConversationMessages(query)
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: ['Chat'],
        }),
        sendConversationMessage: builder.mutation<
            SendConversationMessageResponse,
            SendConversationMessagePayload
        >({
            queryFn: async (payload) => {
                try {
                    const data = await sendConversationMessage(payload)
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            invalidatesTags: ['Chat'],
        }),
        markConversationRead: builder.mutation<MarkConversationReadResponse, number>({
            queryFn: async (peerDatingId) => {
                try {
                    const data = await markConversationRead(peerDatingId)
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            invalidatesTags: ['Chat'],
        }),
    }),
})

export const {
    useGetChatContactsQuery,
    useGetChatMessagesQuery,
    useSendChatMessageMutation,
    useGetConversationsQuery,
    useGetConversationMessagesQuery,
    useSendConversationMessageMutation,
    useMarkConversationReadMutation,
} = chatApi
