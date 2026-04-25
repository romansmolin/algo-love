export interface ContactPreview {
    id: number
    username: string
    avatarUrl?: string
    unreadCount?: number
    onlineStatus?: 'online' | 'recent' | 'offline'
    isFriend?: boolean
    lastMessagePreview?: string
}

export interface ChatMessage {
    id: number | string
    senderId?: number
    text?: string
    sentAt?: string
    extra?: string
}

export interface ContactsResponse {
    contacts: ContactPreview[]
}

export interface MessagesResponse {
    messages: ChatMessage[]
}

export interface SendMessageRequest {
    contactId: number
    contact?: string
    message: string
}

export interface SendMessageResponse {
    message?: string
    date?: string
}

export interface ConversationSummary {
    id: string
    peerDatingId: number
    lastMessageAt: string | null
    lastReadAt: string | null
    lastMessagePreview: string | null
    unreadCount: number
}

export interface ConversationsListResponse {
    conversations: ConversationSummary[]
}

export interface ConversationMessage {
    id: string
    legacyId: string | null
    senderDatingId: number
    body: string
    createdAt: string
    deliveredAt: string | null
    readAt: string | null
}

export interface ConversationMessagesResponse {
    messages: ConversationMessage[]
    nextCursor: string | null
}

export interface SendConversationMessageRequest {
    body: string
    idempotencyKey: string
}

export interface SendConversationMessageResponse {
    message: ConversationMessage
}

export interface MarkConversationReadResponse {
    lastReadAt: string
}
