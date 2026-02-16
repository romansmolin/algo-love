'use client'

import { useMemo, useState } from 'react'
import { Activity, Crown, Gift } from 'lucide-react'
import { useGetCommunityActivityQuery, useGetTopMembersQuery } from '@/entities/dashboard/api/client/endpoints'
import { useGetGiftInventoryQuery } from '@/entities/gift/api/client/endpoints'
import type { ActivityAction } from '@/entities/dashboard/model/types'
import { AppPageShell, AppSectionCard, QueryState } from '@/components/app'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/css/utils'

const actionLabels: Record<ActivityAction, string> = {
    con: 'is online',
    visite: 'visited your profile',
    vote: 'voted on profile',
    modif: 'updated profile',
    add_tof: 'added photos',
    birthday: 'has a birthday',
    friends: 'made a friend',
}

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

const initials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

export default function DashboardPage() {
    const [gender, setGender] = useState<'women' | 'men'>('women')

    const topMembersQuery = useGetTopMembersQuery({ gender })
    const activityQuery = useGetCommunityActivityQuery()
    const giftInventoryQuery = useGetGiftInventoryQuery()

    const topMembers = topMembersQuery.data?.items ?? []
    const activities = activityQuery.data?.items ?? []
    const giftItems = giftInventoryQuery.data?.items ?? []

    const topMembersActions = useMemo(
        () => (
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
                <button
                    type="button"
                    onClick={() => setGender('women')}
                    className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition',
                        gender === 'women' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
                    )}
                >
                    Women
                </button>
                <button
                    type="button"
                    onClick={() => setGender('men')}
                    className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition',
                        gender === 'men' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
                    )}
                >
                    Men
                </button>
            </div>
        ),
        [gender],
    )

    return (
        <AppPageShell
            title="Home"
            description="Your compatibility feed: top members, community activity, and gifts from your library."
        >
            <AppSectionCard
                title="Top Members"
                description="Discover strong candidates ranked by activity and profile quality."
                actions={topMembersActions}
            >
                <QueryState
                    isLoading={topMembersQuery.isLoading}
                    isError={topMembersQuery.isError}
                    error={topMembersQuery.error}
                    isEmpty={!topMembersQuery.isLoading && !topMembersQuery.isError && topMembers.length === 0}
                    emptyMessage="No top members found for this filter."
                    loadingMessage="Loading top members..."
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {topMembers.map((member) => (
                            <article key={member.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-start gap-3">
                                    {member.photoUrl ? (
                                        <img
                                            src={member.photoUrl}
                                            alt={member.username}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-warm)] text-sm font-semibold text-slate-700">
                                            {initials(member.username)}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">{member.username}</p>
                                        <p className="text-xs text-slate-500">
                                            {[member.age ? `${member.age} yrs` : null, member.location ?? null]
                                                .filter(Boolean)
                                                .join(' • ') || 'Profile details unavailable'}
                                        </p>
                                    </div>
                                    {typeof member.rating === 'number' ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-warm)] px-2 py-1 text-xs font-medium text-slate-700">
                                            <Crown className="h-3.5 w-3.5" />
                                            {member.rating.toFixed(1)}
                                        </span>
                                    ) : null}
                                </div>
                            </article>
                        ))}
                    </div>
                </QueryState>
            </AppSectionCard>

            <div className="grid gap-6 lg:grid-cols-2">
                <AppSectionCard title="Recent Activity" description="Live actions from the community around you.">
                    <QueryState
                        isLoading={activityQuery.isLoading}
                        isError={activityQuery.isError}
                        error={activityQuery.error}
                        isEmpty={!activityQuery.isLoading && !activityQuery.isError && activities.length === 0}
                        emptyMessage="No activity yet."
                        loadingMessage="Loading community activity..."
                    >
                        <ul className="space-y-3">
                            {activities.map((item) => (
                                <li key={String(item.id)} className="rounded-xl border border-slate-200 p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="inline-flex items-start gap-2">
                                            <Activity className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                                            <div>
                                                <p className="text-sm text-slate-800">
                                                    <span className="font-medium">{item.username}</span>{' '}
                                                    {actionLabels[item.action] ?? item.action}
                                                </p>
                                                <p className="text-xs text-slate-500">{item.location ?? 'Location hidden'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500">{formatDate(item.timestamp)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </QueryState>
                </AppSectionCard>

                <AppSectionCard title="My Gift Library" description="Gifts currently available to send from your inventory.">
                    <QueryState
                        isLoading={giftInventoryQuery.isLoading}
                        isError={giftInventoryQuery.isError}
                        error={giftInventoryQuery.error}
                        isEmpty={!giftInventoryQuery.isLoading && !giftInventoryQuery.isError && giftItems.length === 0}
                        emptyMessage="No gifts in your library yet."
                        loadingMessage="Loading your gift library..."
                    >
                        <div className="space-y-3">
                            {giftItems.map((giftItem) => (
                                <article key={giftItem.giftId} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent-warm)] text-[var(--accent)]">
                                            <Gift className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-900">{giftItem.giftName}</p>
                                            <p className="text-xs text-slate-500">Updated {formatDate(giftItem.updatedAt)}</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-[var(--accent-warm)] px-3 py-1 text-xs font-semibold text-slate-800">
                                        x{giftItem.quantity}
                                    </span>
                                </article>
                            ))}
                        </div>
                    </QueryState>
                </AppSectionCard>
            </div>

            <div className="flex justify-end">
                <Button asChild variant="secondary">
                    <a href="/gifts">Open Gifts Page</a>
                </Button>
            </div>
        </AppPageShell>
    )
}
