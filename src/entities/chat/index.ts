export type {
    ChatMessage,
    ContactPreview,
    ContactsResponse,
    ConversationMessage,
    ConversationMessagesResponse,
    ConversationSummary,
    ConversationsListResponse,
    MarkConversationReadResponse,
    MessagesResponse,
    SendConversationMessageRequest,
    SendConversationMessageResponse,
    SendMessageRequest,
    SendMessageResponse,
} from './model/types'

export {
    useGetChatContactsQuery,
    useGetChatMessagesQuery,
    useSendChatMessageMutation,
    useGetConversationsQuery,
    useGetConversationMessagesQuery,
    useSendConversationMessageMutation,
    useMarkConversationReadMutation,
} from './api/client/endpoints'

export type { GetChatMessagesQuery } from './api/client/services/chat.service'

export { ChatController } from './api/server/controllers/chat.controller'
export { ChatService } from './api/server/services/chat.service'
export {
    ChatRepository,
    type ContactBlock,
    type EclairBlock,
    type LoadContactsResponse,
    type LoadMessagesResponse,
    type SendMessageApiResponse,
} from './api/server/repositories/chat.repo'

export { ConversationRepository } from './api/server/repositories/conversation.repo'
export { MessageRepository } from './api/server/repositories/message.repo'
export { ListConversationsUseCase } from './api/server/use-cases/list-conversations.usecase'
export { ListMessagesUseCase } from './api/server/use-cases/list-messages.usecase'
export { MarkConversationReadUseCase } from './api/server/use-cases/mark-conversation-read.usecase'
export { SendConversationMessageUseCase } from './api/server/use-cases/send-message.usecase'
export { ConversationsController } from './api/server/controllers/conversations.controller'
