import 'server-only'

import { notify, subscribe } from '@/shared/lib/realtime/pg-notify'
import type { ConversationMessage } from '@/entities/chat/model/types'

export type ChatEvent =
    | {
          type: 'message.created'
          conversationId: string
          peerDatingId: number
          message: ConversationMessage
      }

const channelForDatingId = (datingId: number): string => `chat_dating_${datingId}`

export const publishChatEvent = async (
    recipientDatingIds: number[],
    event: ChatEvent,
): Promise<void> => {
    const payload = JSON.stringify(event)
    const unique = Array.from(new Set(recipientDatingIds.filter((id) => Number.isFinite(id))))

    await Promise.all(unique.map((id) => notify(channelForDatingId(id), payload)))
}

export const subscribeChatEvents = async (
    datingId: number,
    handler: (event: ChatEvent) => void,
): Promise<() => Promise<void>> => {
    return subscribe(channelForDatingId(datingId), (raw) => {
        try {
            const parsed = JSON.parse(raw) as ChatEvent
            handler(parsed)
        } catch (error) {
            console.error('[chat-events] failed to parse payload', { error })
        }
    })
}
