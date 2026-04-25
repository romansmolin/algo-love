import 'server-only'

import { Client } from 'pg'

const resolveDatabaseConnectionString = (): string => {
    const databaseUrl = process.env.DATABASE_URL?.trim()
    const prismaDatabaseUrl = process.env.PRISMA_DATABASE_URL?.trim()

    if (databaseUrl) return databaseUrl
    if (prismaDatabaseUrl && !prismaDatabaseUrl.startsWith('prisma://')) return prismaDatabaseUrl

    throw new Error('DATABASE_URL must be set to a PostgreSQL connection string')
}

type Listener = (payload: string) => void

type GlobalState = {
    listenClient: Client | null
    listenClientPromise: Promise<Client> | null
    notifyClient: Client | null
    notifyClientPromise: Promise<Client> | null
    subscriptions: Map<string, Set<Listener>>
}

const globalForRealtime = globalThis as unknown as { __pgNotify?: GlobalState }

const state: GlobalState =
    globalForRealtime.__pgNotify ??
    (globalForRealtime.__pgNotify = {
        listenClient: null,
        listenClientPromise: null,
        notifyClient: null,
        notifyClientPromise: null,
        subscriptions: new Map(),
    })

const ensureListenClient = async (): Promise<Client> => {
    if (state.listenClient) return state.listenClient
    if (state.listenClientPromise) return state.listenClientPromise

    state.listenClientPromise = (async () => {
        const client = new Client({ connectionString: resolveDatabaseConnectionString() })
        await client.connect()

        client.on('notification', (msg) => {
            if (!msg.channel) return
            const subs = state.subscriptions.get(msg.channel)
            if (!subs) return
            const payload = msg.payload ?? ''
            for (const listener of subs) {
                try {
                    listener(payload)
                } catch (error) {
                    console.error('[pg-notify] listener threw', { channel: msg.channel, error })
                }
            }
        })

        client.on('error', (error) => {
            console.error('[pg-notify] listen client error', error)
            state.listenClient = null
            state.listenClientPromise = null
            // Re-LISTEN on every active channel after reconnect.
            const channels = [...state.subscriptions.keys()]
            void Promise.all(channels.map((channel) => listen(channel)))
        })

        state.listenClient = client
        return client
    })()

    return state.listenClientPromise
}

const ensureNotifyClient = async (): Promise<Client> => {
    if (state.notifyClient) return state.notifyClient
    if (state.notifyClientPromise) return state.notifyClientPromise

    state.notifyClientPromise = (async () => {
        const client = new Client({ connectionString: resolveDatabaseConnectionString() })
        await client.connect()
        client.on('error', (error) => {
            console.error('[pg-notify] notify client error', error)
            state.notifyClient = null
            state.notifyClientPromise = null
        })
        state.notifyClient = client
        return client
    })()

    return state.notifyClientPromise
}

const listen = async (channel: string): Promise<void> => {
    const client = await ensureListenClient()
    // Identifiers in LISTEN must be quoted to allow special characters/case.
    const safe = channel.replace(/"/g, '""')
    await client.query(`LISTEN "${safe}"`)
}

const unlisten = async (channel: string): Promise<void> => {
    const client = state.listenClient
    if (!client) return
    const safe = channel.replace(/"/g, '""')
    try {
        await client.query(`UNLISTEN "${safe}"`)
    } catch (error) {
        console.error('[pg-notify] UNLISTEN failed', { channel, error })
    }
}

export const subscribe = async (
    channel: string,
    listener: Listener,
): Promise<() => Promise<void>> => {
    let subs = state.subscriptions.get(channel)
    const isNewChannel = !subs || subs.size === 0

    if (!subs) {
        subs = new Set()
        state.subscriptions.set(channel, subs)
    }
    subs.add(listener)

    if (isNewChannel) {
        await listen(channel)
    }

    return async () => {
        const current = state.subscriptions.get(channel)
        if (!current) return
        current.delete(listener)
        if (current.size === 0) {
            state.subscriptions.delete(channel)
            await unlisten(channel)
        }
    }
}

export const notify = async (channel: string, payload: string): Promise<void> => {
    const client = await ensureNotifyClient()
    await client.query('SELECT pg_notify($1, $2)', [channel, payload])
}
