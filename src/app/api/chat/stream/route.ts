import { NextRequest } from 'next/server'
import { AppError } from '@/shared/errors/app-error'
import { subscribeChatEvents, type ChatEvent } from '@/entities/chat/api/server/services/chat-events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HEARTBEAT_INTERVAL_MS = 30_000

const parseDatingId = (raw: string | undefined): number => {
    if (!raw) throw AppError.authenticationError('Authentication required')
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
        throw AppError.authenticationError('Authentication required')
    }
    return parsed
}

const formatEvent = (event: ChatEvent): string => {
    return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
}

export async function GET(request: NextRequest): Promise<Response> {
    const datingId = parseDatingId(request.cookies.get('dating_user_id')?.value)

    const encoder = new TextEncoder()

    let unsubscribe: (() => Promise<void>) | null = null
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const enqueue = (chunk: string): void => {
                try {
                    controller.enqueue(encoder.encode(chunk))
                } catch {
                    // Stream already closed; nothing to do.
                }
            }

            // Initial comment + retry hint so the client reconnects within 5s
            // if the connection drops.
            enqueue(`retry: 5000\n: connected dating_id=${datingId}\n\n`)

            heartbeatTimer = setInterval(() => {
                enqueue(`: heartbeat ${Date.now()}\n\n`)
            }, HEARTBEAT_INTERVAL_MS)

            try {
                unsubscribe = await subscribeChatEvents(datingId, (event) => {
                    enqueue(formatEvent(event))
                })
            } catch (error) {
                console.error('[chat-stream] subscribe failed', { error })
                controller.error(error)
                return
            }

            request.signal.addEventListener('abort', () => {
                if (heartbeatTimer) clearInterval(heartbeatTimer)
                if (unsubscribe) void unsubscribe()
                try {
                    controller.close()
                } catch {
                    // Already closed.
                }
            })
        },
        async cancel() {
            if (heartbeatTimer) clearInterval(heartbeatTimer)
            if (unsubscribe) await unsubscribe()
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    })
}
