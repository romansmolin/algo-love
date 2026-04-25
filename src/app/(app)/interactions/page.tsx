'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Sparkles } from 'lucide-react'
import { useGetInteractionsQuery } from '@/entities/match/api/client/endpoints'
import type { InteractionDirection, InteractionItem } from '@/entities/match/model/types'
import { AppPageShell, AppSectionCard, QueryState } from '@/components/app'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/css/utils'

const PAGE_SIZE = 20

const initials = (name: string): string => {
    const normalized = name.trim()
    if (!normalized) return 'U'
    const parts = normalized.split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

const formatDate = (iso: string): string => {
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch {
        return iso
    }
}

const tabs: { value: InteractionDirection; label: string; icon: typeof Heart; description: string }[] = [
    {
        value: 'outgoing',
        label: 'Liked by me',
        icon: Heart,
        description: 'Profiles you have liked.',
    },
    {
        value: 'incoming',
        label: 'Admirers',
        icon: Sparkles,
        description: 'Profiles that liked you.',
    },
]

export default function InteractionsPage() {
    const [direction, setDirection] = useState<InteractionDirection>('outgoing')
    const [before, setBefore] = useState<string | undefined>(undefined)

    const query = useGetInteractionsQuery(
        { direction, limit: PAGE_SIZE, before },
        { refetchOnFocus: true },
    )

    const items = query.data?.items ?? []
    const nextCursor = query.data?.nextCursor ?? null
    const activeTab = tabs.find((tab) => tab.value === direction) ?? tabs[0]

    return (
        <AppPageShell
            title="Interactions"
            description="See who you have liked and who has liked you back."
        >
            <AppSectionCard
                title={activeTab.label}
                description={activeTab.description}
            >
                <div className="mb-4 flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = tab.value === direction
                        return (
                            <Button
                                key={tab.value}
                                type="button"
                                variant={isActive ? 'default' : 'outline'}
                                onClick={() => {
                                    setDirection(tab.value)
                                    setBefore(undefined)
                                }}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </Button>
                        )
                    })}
                </div>

                <QueryState
                    isLoading={query.isLoading}
                    isError={query.isError}
                    error={query.error}
                    isEmpty={!query.isLoading && !query.isError && items.length === 0}
                    emptyMessage={
                        direction === 'outgoing'
                            ? 'You have not liked anyone yet.'
                            : 'No admirers yet — keep exploring!'
                    }
                    loadingMessage="Loading interactions..."
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <InteractionCard key={`${item.datingId}-${item.createdAt}`} item={item} />
                        ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!nextCursor || query.isFetching}
                            onClick={() => nextCursor && setBefore(nextCursor)}
                        >
                            {nextCursor ? 'Load more' : 'No more'}
                        </Button>
                        {before ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setBefore(undefined)}
                            >
                                Restart
                            </Button>
                        ) : null}
                    </div>
                </QueryState>
            </AppSectionCard>
        </AppPageShell>
    )
}

function InteractionCard({ item }: { item: InteractionItem }) {
    const profile = item.profile
    const username = profile?.username ?? `Member #${item.datingId || '—'}`
    const photoUrl = profile?.photoUrl
    const meta = [
        profile?.age ? `${profile.age} yrs` : null,
        profile?.location ?? null,
    ]
        .filter(Boolean)
        .join(' • ')

    const isInteractive = item.datingId > 0
    const Wrapper: React.ElementType = isInteractive ? Link : 'div'
    const wrapperProps = isInteractive ? { href: `/users/${item.datingId}` } : {}

    return (
        <Wrapper
            {...wrapperProps}
            className={cn(
                'flex items-start gap-3 rounded-2xl border border-slate-200 p-3 transition',
                isInteractive ? 'hover:bg-[var(--accent-warm)]' : 'opacity-70',
            )}
        >
            {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={photoUrl}
                    alt={username}
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
            ) : (
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-[var(--accent-warm)] text-sm font-semibold text-slate-700">
                    {initials(username)}
                </div>
            )}
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{username}</p>
                <p className="truncate text-xs text-slate-500">{meta || 'Details unavailable'}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                    {formatDate(item.createdAt)}
                </p>
            </div>
        </Wrapper>
    )
}
