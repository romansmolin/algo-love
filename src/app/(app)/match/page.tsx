'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ExternalLink,
    Heart,
    HeartCrack,
    HeartHandshake,
    Image as ImageIcon,
    Loader2,
    MapPin,
    MousePointerClick,
    RotateCcw,
    SkipForward,
    Star,
    UserRoundX,
    X,
} from 'lucide-react'
import { useDiscoverMatchesQuery, useMatchActionMutation } from '@/entities/match/api/client/endpoints'
import { AppPageShell, AppSectionCard, QueryState, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/css/utils'

const toPositiveInt = (value: string): number | undefined => {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed < 1) return undefined
    return parsed
}

const initials = (name: string): string => {
    const normalized = name.trim()
    if (!normalized) return 'U'
    const parts = normalized.split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

export default function MatchPage() {
    const [gender, setGender] = useState<'women' | 'men' | 'couple'>('women')
    const [cursor, setCursor] = useState<string | null>(null)
    const [limit] = useState(12)
    const [ageFromInput, setAgeFromInput] = useState('')
    const [ageToInput, setAgeToInput] = useState('')
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [actionStatus, setActionStatus] = useState<string | null>(null)

    const ageFrom = toPositiveInt(ageFromInput)
    const ageTo = toPositiveInt(ageToInput)
    const invalidAgeRange = ageFrom !== undefined && ageTo !== undefined && ageFrom > ageTo

    const discoverQuery = useMemo(
        () => ({
            cursor,
            limit,
            gender,
            ...(invalidAgeRange ? {} : { ageFrom, ageTo }),
        }),
        [ageFrom, ageTo, cursor, gender, invalidAgeRange, limit],
    )

    const discoverMatchesQuery = useDiscoverMatchesQuery(discoverQuery, {
        refetchOnFocus: true,
    })

    const [matchAction, { isLoading: isActionLoading }] = useMatchActionMutation()

    const recommendations = useMemo(
        () => discoverMatchesQuery.data?.items ?? [],
        [discoverMatchesQuery.data?.items],
    )
    const nextCursor = discoverMatchesQuery.data?.nextCursor ?? null
    const resetFilterCursor = () => setCursor(null)

    const effectiveSelectedId = useMemo(() => {
        if (recommendations.length === 0) return null

        const exists = selectedId != null && recommendations.some((candidate) => candidate.id === selectedId)
        if (exists) return selectedId

        return recommendations[0]?.id ?? null
    }, [recommendations, selectedId])

    const selectedCandidate = useMemo(
        () => recommendations.find((candidate) => candidate.id === effectiveSelectedId) ?? null,
        [recommendations, effectiveSelectedId],
    )

    const runAction = async (action: 'like' | 'dislike' | 'skip') => {
        if (!selectedCandidate) return

        setActionStatus(null)

        const actedUserId = selectedCandidate.id
        const result = await matchAction({
            userId: actedUserId,
            action,
        })

        if ('error' in result) {
            setActionStatus(getErrorMessage(result.error, 'Could not apply match action.'))
            return
        }

        // Server now persists interactions and excludes them from /discover.
        // Refetching pulls the next batch with the acted candidate filtered out.
        await discoverMatchesQuery.refetch()

        if (result.data.isMatch) {
            setActionStatus('It is a match! User was moved out of recommendations.')
            return
        }

        const verbs: Record<'like' | 'dislike' | 'skip', string> = {
            like: 'Liked',
            dislike: 'Disliked',
            skip: 'Skipped',
        }
        setActionStatus(
            result.data.result ||
                `${verbs[action]} successfully. User removed from recommendations.`,
        )
    }

    return (
        <AppPageShell
            title="Match"
            description="Review recommendations, inspect candidate profiles, and run like/dislike actions."
        >
            <AppSectionCard
                title="Recommendation Filters"
                description="Pick who you want to see — results refresh automatically."
            >
                <div className="flex flex-col gap-5">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Show me
                            </label>
                            <div
                                role="radiogroup"
                                aria-label="Gender"
                                className="inline-flex w-full rounded-full border border-slate-200 bg-slate-100 p-1"
                            >
                                {[
                                    { value: 'women', label: 'Women' },
                                    { value: 'men', label: 'Men' },
                                    { value: 'couple', label: 'Couples' },
                                ].map((option) => {
                                    const isActive = gender === option.value
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={isActive}
                                            onClick={() => {
                                                setGender(option.value as 'women' | 'men' | 'couple')
                                                resetFilterCursor()
                                            }}
                                            className={cn(
                                                'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                                                isActive
                                                    ? 'bg-white text-slate-900 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900',
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Age range
                                </label>
                                <span className="text-xs text-slate-500">
                                    {ageFrom != null || ageTo != null
                                        ? `${ageFrom ?? 18} – ${ageTo ?? '∞'}`
                                        : 'any age'}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    'flex h-11 items-center rounded-xl border bg-white pl-1 pr-3 transition focus-within:ring-2 focus-within:ring-[var(--accent)]',
                                    invalidAgeRange ? 'border-red-300' : 'border-slate-300',
                                )}
                            >
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={18}
                                    value={ageFromInput}
                                    onChange={(event) => {
                                        setAgeFromInput(event.target.value)
                                        resetFilterCursor()
                                    }}
                                    placeholder="18"
                                    aria-label="Minimum age"
                                    className="h-full w-full min-w-0 rounded-l-xl bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                                <span className="px-1 text-slate-400">–</span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={18}
                                    value={ageToInput}
                                    onChange={(event) => {
                                        setAgeToInput(event.target.value)
                                        resetFilterCursor()
                                    }}
                                    placeholder="45"
                                    aria-label="Maximum age"
                                    className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                                {ageFromInput || ageToInput ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAgeFromInput('')
                                            setAgeToInput('')
                                            resetFilterCursor()
                                        }}
                                        aria-label="Clear age range"
                                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                ) : null}
                            </div>
                            {invalidAgeRange ? (
                                <p className="text-xs text-red-600">
                                    Minimum age must be less than or equal to the maximum.
                                </p>
                            ) : null}
                        </div>

                        <div className="flex items-end gap-3 self-end lg:flex-col lg:items-stretch">
                            <span className="hidden text-xs font-medium uppercase tracking-wide text-slate-500 lg:block">
                                Per page
                            </span>
                            <span className="inline-flex h-11 min-w-[5rem] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                                {limit}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            {discoverMatchesQuery.isFetching ? (
                                <span className="inline-flex items-center gap-1.5 text-slate-600">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Updating recommendations…
                                </span>
                            ) : (
                                <span>
                                    Showing {recommendations.length} candidate
                                    {recommendations.length === 1 ? '' : 's'}
                                    {cursor ? ' (next page)' : ''}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={cursor == null}
                                onClick={resetFilterCursor}
                            >
                                <RotateCcw className="h-4 w-4" />
                                Restart
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={!nextCursor || discoverMatchesQuery.isFetching}
                                onClick={() => nextCursor && setCursor(nextCursor)}
                            >
                                {nextCursor ? 'Load more' : 'No more'}
                            </Button>
                        </div>
                    </div>
                </div>
            </AppSectionCard>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                <AppSectionCard title="Match Recommendations" description="Candidates from /api/match/discover.">
                    <QueryState
                        isLoading={discoverMatchesQuery.isLoading}
                        isError={discoverMatchesQuery.isError}
                        error={discoverMatchesQuery.error}
                        isEmpty={!discoverMatchesQuery.isLoading && !discoverMatchesQuery.isError && recommendations.length === 0}
                        emptyMessage="No recommendations for the selected filters."
                        loadingMessage="Loading recommendations..."
                    >
                        <p className="mb-3 text-xs text-slate-500">
                            Already-liked or already-skipped candidates are excluded server-side.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {recommendations.map((candidate) => (
                                <article
                                    key={candidate.id}
                                    className={cn(
                                        'cursor-pointer rounded-2xl border p-4 transition',
                                        effectiveSelectedId === candidate.id
                                            ? 'border-[var(--accent)] bg-[var(--accent-warm)]'
                                            : 'border-slate-200 hover:bg-slate-50',
                                    )}
                                    onClick={() => setSelectedId(candidate.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            {candidate.photoUrl ? (
                                                <img
                                                    src={candidate.photoUrl}
                                                    alt={candidate.username}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-xs font-semibold text-slate-700">
                                                    {initials(candidate.username)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{candidate.username}</p>
                                                <p className="text-xs text-slate-500">
                                                    {[candidate.age ? `${candidate.age} yrs` : null, candidate.location ?? null]
                                                        .filter(Boolean)
                                                        .join(' • ') || 'Details unavailable'}
                                                </p>
                                            </div>
                                        </div>
                                        {typeof candidate.rating === 'number' ? (
                                            <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-700">
                                                {candidate.rating.toFixed(1)}
                                            </span>
                                        ) : null}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </QueryState>
                </AppSectionCard>

                <AppSectionCard title="Selected Profile" description="Review and run match actions.">
                    {!selectedCandidate ? (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-400">
                                <MousePointerClick className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">No profile selected</p>
                            <p className="text-xs text-slate-500">
                                Tap a card on the left to preview and act here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <div className="relative aspect-[4/5] w-full max-h-[32rem] bg-gradient-to-br from-[var(--accent-warm)] to-slate-100">
                                    {selectedCandidate.photoUrl ? (
                                        <img
                                            src={selectedCandidate.photoUrl}
                                            alt={selectedCandidate.username}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-5xl font-semibold text-slate-700">
                                            {initials(selectedCandidate.username)}
                                        </div>
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                    <div className="absolute right-2 top-2 flex flex-wrap items-center gap-1">
                                        {typeof selectedCandidate.rating === 'number' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-800 shadow-sm backdrop-blur">
                                                <Star className="h-3 w-3 text-amber-500" />
                                                {selectedCandidate.rating.toFixed(1)}
                                            </span>
                                        ) : null}
                                        {selectedCandidate.photoCount && selectedCandidate.photoCount > 1 ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-800 shadow-sm backdrop-blur">
                                                <ImageIcon className="h-3 w-3" />
                                                {selectedCandidate.photoCount}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                                        <h3 className="text-lg font-semibold">
                                            {selectedCandidate.username}
                                            {selectedCandidate.age ? (
                                                <span className="ml-1 font-normal opacity-90">
                                                    , {selectedCandidate.age}
                                                </span>
                                            ) : null}
                                        </h3>
                                        {selectedCandidate.location ? (
                                            <p className="inline-flex items-center gap-1 text-sm opacity-90">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {selectedCandidate.location}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 px-4 py-3">
                                    {selectedCandidate.gender ? (
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-700">
                                            {selectedCandidate.gender}
                                        </span>
                                    ) : null}
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                        ID #{selectedCandidate.id}
                                    </span>
                                    <Link
                                        href={`/users/${selectedCandidate.id}`}
                                        className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
                                    >
                                        Full profile
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            </article>

                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => runAction('like')}
                                >
                                    <Heart className="h-4 w-4" />
                                    Like
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isActionLoading}
                                    onClick={() => runAction('skip')}
                                >
                                    <SkipForward className="h-4 w-4" />
                                    Skip
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isActionLoading}
                                    onClick={() => runAction('dislike')}
                                >
                                    <UserRoundX className="h-4 w-4" />
                                    Pass
                                </Button>
                            </div>

                            {actionStatus ? (
                                <div
                                    className={cn(
                                        'flex items-start gap-2 rounded-xl border p-3 text-sm',
                                        /match/i.test(actionStatus)
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                            : 'border-slate-200 bg-slate-50 text-slate-700',
                                    )}
                                    role="status"
                                >
                                    {/match/i.test(actionStatus) ? (
                                        <HeartHandshake className="mt-0.5 h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <HeartCrack className="mt-0.5 h-4 w-4 text-slate-500" />
                                    )}
                                    <span>{actionStatus}</span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </AppSectionCard>
            </div>

        </AppPageShell>
    )
}
