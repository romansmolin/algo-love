import { apiClient } from '@/shared/api/client/axios.config'
import type {
    ContactsResponse,
    ConversationMessagesResponse,
    ConversationsListResponse,
    MarkConversationReadResponse,
    MessagesResponse,
    SendConversationMessageRequest,
    SendConversationMessageResponse,
    SendMessageRequest,
    SendMessageResponse,
} from '@/entities/chat/model/types'

export type GetChatMessagesQuery = {
    contactId: number
    contact?: string
}

export type GetConversationMessagesQuery = {
    peerDatingId: number
    before?: string
    limit?: number
}

export type SendConversationMessagePayload = SendConversationMessageRequest & {
    peerDatingId: number
}

export async function getChatContacts(): Promise<ContactsResponse> {
    const response = await apiClient.get<ContactsResponse>('/api/chat/contacts')
    return response.data
}

export async function getChatMessages(query: GetChatMessagesQuery): Promise<MessagesResponse> {
    const params = new URLSearchParams()
    params.set('contactId', String(query.contactId))

    if (query.contact) {
        params.set('contact', query.contact)
    }

    const response = await apiClient.get<MessagesResponse>(`/api/chat/messages?${params.toString()}`)
    return response.data
}

export async function sendChatMessage(payload: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await apiClient.post<SendMessageResponse>('/api/chat/send', payload)
    return response.data
}

export async function getConversations(): Promise<ConversationsListResponse> {
    const response = await apiClient.get<ConversationsListResponse>('/api/chat/conversations')
    return response.data
}

export async function getConversationMessages(
    query: GetConversationMessagesQuery,
): Promise<ConversationMessagesResponse> {
    const params = new URLSearchParams()
    if (query.before) params.set('before', query.before)
    if (typeof query.limit === 'number') params.set('limit', String(query.limit))
    const qs = params.toString()
    const path = `/api/chat/conversations/${query.peerDatingId}/messages${qs ? `?${qs}` : ''}`

    const response = await apiClient.get<ConversationMessagesResponse>(path)
    return response.data
}

export async function sendConversationMessage(
    payload: SendConversationMessagePayload,
): Promise<SendConversationMessageResponse> {
    const { peerDatingId, ...body } = payload
    const response = await apiClient.post<SendConversationMessageResponse>(
        `/api/chat/conversations/${peerDatingId}/messages`,
        body,
    )
    return response.data
}

export async function markConversationRead(
    peerDatingId: number,
): Promise<MarkConversationReadResponse> {
    const response = await apiClient.post<MarkConversationReadResponse>(
        `/api/chat/conversations/${peerDatingId}/read`,
        {},
    )
    return response.data
}
