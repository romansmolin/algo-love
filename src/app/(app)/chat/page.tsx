'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { MessageCircle, Search, Send } from 'lucide-react'
import { useGetChatContactsQuery, useGetChatMessagesQuery, useSendChatMessageMutation } from '@/entities/chat/api/client/endpoints'
import { AppPageShell, AppSectionCard, QueryState, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/css/utils'

const formatDate = (value?: string): string => {
    if (!value) return 'Unknown time'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

const resolveInitialContactId = (): number | null => {
    if (typeof window === 'undefined') return null

    const param = new URLSearchParams(window.location.search).get('contactId')
    const parsed = Number(param)

    if (Number.isFinite(parsed) && parsed > 0) return parsed
    return null
}

export default function ChatPage() {
    const [selectedContactId, setSelectedContactId] = useState<number | null>(resolveInitialContactId)
    const [search, setSearch] = useState('')
    const [messageInput, setMessageInput] = useState('')
    const [sendError, setSendError] = useState<string | null>(null)

    const contactsQuery = useGetChatContactsQuery(undefined, {
        pollingInterval: 15_000,
        refetchOnFocus: true,
    })

    const contacts = useMemo(() => contactsQuery.data?.contacts ?? [], [contactsQuery.data?.contacts])

    const effectiveSelectedContactId = useMemo(() => {
        if (contacts.length === 0) return null

        const selectedStillExists =
            selectedContactId != null && contacts.some((contact) => contact.id === selectedContactId)

        if (selectedStillExists) return selectedContactId
        return contacts[0]?.id ?? null
    }, [contacts, selectedContactId])

    const selectedContact = useMemo(
        () => contacts.find((contact) => contact.id === effectiveSelectedContactId) ?? null,
        [contacts, effectiveSelectedContactId],
    )

    const messagesQuery = useGetChatMessagesQuery(
        {
            contactId: effectiveSelectedContactId ?? 0,
            contact: selectedContact?.username,
        },
        {
            skip: !effectiveSelectedContactId,
            pollingInterval: 5_000,
            refetchOnFocus: true,
        },
    )

    const messages = useMemo(() => {
        const items = messagesQuery.data?.messages ?? []

        return [...items].sort((left, right) => {
            const leftDate = left.sentAt ? new Date(left.sentAt).getTime() : 0
            const rightDate = right.sentAt ? new Date(right.sentAt).getTime() : 0
            if (leftDate !== rightDate) return leftDate - rightDate

            const leftId = typeof left.id === 'number' ? left.id : Number.parseInt(String(left.id), 10)
            const rightId = typeof right.id === 'number' ? right.id : Number.parseInt(String(right.id), 10)

            if (Number.isFinite(leftId) && Number.isFinite(rightId)) {
                return leftId - rightId
            }

            return String(left.id).localeCompare(String(right.id))
        })
    }, [messagesQuery.data?.messages])

    const filteredContacts = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return contacts
        return contacts.filter((contact) => contact.username.toLowerCase().includes(term))
    }, [contacts, search])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const url = new URL(window.location.href)

        if (effectiveSelectedContactId) {
            url.searchParams.set('contactId', String(effectiveSelectedContactId))
        } else {
            url.searchParams.delete('contactId')
        }

        window.history.replaceState({}, '', `${url.pathname}${url.search}`)
    }, [effectiveSelectedContactId])

    const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation()

    const handleSend = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!effectiveSelectedContactId) {
            setSendError('Select a conversation first.')
            return
        }

        const message = messageInput.trim()
        if (!message) {
            setSendError('Message cannot be empty.')
            return
        }

        setSendError(null)

        const result = await sendMessage({
            contactId: effectiveSelectedContactId,
            contact: selectedContact?.username,
            message,
        })

        if ('error' in result) {
            setSendError(getErrorMessage(result.error, 'Failed to send message.'))
            return
        }

        setMessageInput('')
        void messagesQuery.refetch()
    }

    return (
        <AppPageShell
            title="Chat"
            description="Review conversations, open active threads, and send messages in real time with periodic updates."
        >
            <AppSectionCard title="Messages" description="Contacts refresh every 15s, active thread refreshes every 5s.">
                <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                    <div className="space-y-3 rounded-2xl border border-slate-200 p-3">
                        <label className="relative block">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search conversations"
                                className="pl-9"
                            />
                        </label>

                        <QueryState
                            isLoading={contactsQuery.isLoading}
                            isError={contactsQuery.isError}
                            error={contactsQuery.error}
                            isEmpty={!contactsQuery.isLoading && !contactsQuery.isError && filteredContacts.length === 0}
                            emptyMessage="No conversations found."
                            loadingMessage="Loading conversations..."
                        >
                            <ul className="space-y-2">
                                {filteredContacts.map((contact) => (
                                    <li key={contact.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedContactId(contact.id)}
                                            className={cn(
                                                'flex w-full items-start justify-between gap-2 rounded-xl border p-3 text-left transition',
                                                effectiveSelectedContactId === contact.id
                                                    ? 'border-[var(--accent)] bg-[var(--accent-warm)]'
                                                    : 'border-slate-200 hover:bg-slate-50',
                                            )}
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{contact.username}</p>
                                                <p className="text-xs text-slate-500">
                                                    {contact.lastMessagePreview ?? 'No preview available'}
                                                </p>
                                            </div>
                                            {contact.unreadCount ? (
                                                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-semibold text-white">
                                                    {contact.unreadCount}
                                                </span>
                                            ) : null}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </QueryState>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-3">
                        {!selectedContact ? (
                            <div className="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                <div>
                                    <MessageCircle className="mx-auto h-7 w-7 text-slate-400" />
                                    <p className="mt-2 text-sm text-slate-600">Select a conversation to start chatting.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <header className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-900">{selectedContact.username}</p>
                                    <p className="text-xs text-slate-500">
                                        {selectedContact.onlineStatus ? `Status: ${selectedContact.onlineStatus}` : 'Status unavailable'}
                                    </p>
                                </header>

                                <QueryState
                                    isLoading={messagesQuery.isLoading}
                                    isError={messagesQuery.isError}
                                    error={messagesQuery.error}
                                    isEmpty={!messagesQuery.isLoading && !messagesQuery.isError && messages.length === 0}
                                    emptyMessage="No messages yet. Send the first one."
                                    loadingMessage="Loading messages..."
                                >
                                    <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        {messages.map((message, index) => {
                                            const incoming = message.senderId === selectedContact.id

                                            return (
                                                <article
                                                    key={`${String(message.id)}-${index}`}
                                                    className={cn('flex', incoming ? 'justify-start' : 'justify-end')}
                                                >
                                                    <div
                                                        className={cn(
                                                            'max-w-[80%] rounded-2xl border px-3 py-2 text-sm',
                                                            incoming
                                                                ? 'border-slate-200 bg-white text-slate-800'
                                                                : 'border-[var(--accent)] bg-[var(--accent)] text-white',
                                                        )}
                                                    >
                                                        <p>{message.text || message.extra || '...'}</p>
                                                        <p className={cn('mt-1 text-[11px]', incoming ? 'text-slate-500' : 'text-white/75')}>
                                                            {formatDate(message.sentAt)}
                                                        </p>
                                                    </div>
                                                </article>
                                            )
                                        })}
                                    </div>
                                </QueryState>

                                <form onSubmit={handleSend} className="space-y-2">
                                    <Input
                                        placeholder={`Message ${selectedContact.username}`}
                                        value={messageInput}
                                        onChange={(event) => setMessageInput(event.target.value)}
                                    />
                                    {sendError ? <p className="text-xs text-red-600">{sendError}</p> : null}
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isSending || !effectiveSelectedContactId}>
                                            <Send className="h-4 w-4" />
                                            {isSending ? 'Sending...' : 'Send message'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </AppSectionCard>
        </AppPageShell>
    )
}
