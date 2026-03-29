'use client'

import { useMemo, useState } from 'react'
import { Heart, UserRoundX } from 'lucide-react'
import { useDiscoverMatchesQuery, useGetMatchesQuery, useMatchActionMutation } from '@/entities/match/api/client/endpoints'
import { AppPageShell, AppSectionCard, QueryState, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
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
    const [page, setPage] = useState(1)
    const [perPage] = useState(12)
    const [ageFromInput, setAgeFromInput] = useState('')
    const [ageToInput, setAgeToInput] = useState('')
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [actedCandidates, setActedCandidates] = useState<Record<number, 'like' | 'dislike'>>({})
    const [actionStatus, setActionStatus] = useState<string | null>(null)

    const ageFrom = toPositiveInt(ageFromInput)
    const ageTo = toPositiveInt(ageToInput)
    const invalidAgeRange = ageFrom !== undefined && ageTo !== undefined && ageFrom > ageTo

    const discoverQuery = useMemo(
        () => ({
            page,
            perPage,
            gender,
            ...(invalidAgeRange ? {} : { ageFrom, ageTo }),
        }),
        [ageFrom, ageTo, gender, invalidAgeRange, page, perPage],
    )

    const discoverMatchesQuery = useDiscoverMatchesQuery(discoverQuery, {
        refetchOnFocus: true,
    })

    const existingMatchesQuery = useGetMatchesQuery(undefined, {
        refetchOnFocus: true,
    })

    const [matchAction, { isLoading: isActionLoading }] = useMatchActionMutation()

    const recommendations = useMemo(() => {
        const items = discoverMatchesQuery.data?.items ?? []
        return items.filter((candidate) => !actedCandidates[candidate.id])
    }, [discoverMatchesQuery.data?.items, actedCandidates])
    const existingMatches = existingMatchesQuery.data?.items ?? []
    const totalPages = discoverMatchesQuery.data?.totalPages ?? 1

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

    const runAction = async (action: 'like' | 'dislike') => {
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

        setActedCandidates((previous) => ({
            ...previous,
            [actedUserId]: action,
        }))

        if (result.data.isMatch) {
            setActionStatus('It is a match! User was moved out of recommendations.')
            return
        }

        setActionStatus(
            result.data.result || `${action === 'like' ? 'Liked' : 'Disliked'} successfully. User removed from recommendations.`,
        )
    }

    return (
        <AppPageShell
            title="Match"
            description="Review recommendations, inspect candidate profiles, and run like/dislike actions."
        >
            <AppSectionCard title="Recommendation Filters" description="Use filters to refine discover results.">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Gender</label>
                        <select
                            value={gender}
                            onChange={(event) => {
                                setGender(event.target.value as 'women' | 'men' | 'couple')
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
                        >
                            <option value="women">Women</option>
                            <option value="men">Men</option>
                            <option value="couple">Couple</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Age from</label>
                        <Input
                            type="number"
                            min={18}
                            value={ageFromInput}
                            onChange={(event) => {
                                setAgeFromInput(event.target.value)
                                setPage(1)
                            }}
                            placeholder="18"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Age to</label>
                        <Input
                            type="number"
                            min={18}
                            value={ageToInput}
                            onChange={(event) => {
                                setAgeToInput(event.target.value)
                                setPage(1)
                            }}
                            placeholder="45"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Page</label>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                                Prev
                            </Button>
                            <span className="text-sm text-slate-700">
                                {page} / {Math.max(totalPages, 1)}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPage((prev) => Math.min(Math.max(totalPages, 1), prev + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Per page</label>
                        <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                            {perPage}
                        </div>
                    </div>
                </div>

                {invalidAgeRange ? (
                    <p className="mt-3 text-xs text-red-600">Age from must be less than or equal to age to.</p>
                ) : null}
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
                        {Object.keys(actedCandidates).length > 0 ? (
                            <p className="mb-3 text-xs text-slate-500">
                                Filtered out after action: {Object.keys(actedCandidates).length}
                            </p>
                        ) : null}
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
                        <p className="text-sm text-slate-500">Select a recommendation to view profile details.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-start gap-3">
                                    {selectedCandidate.photoUrl ? (
                                        <img
                                            src={selectedCandidate.photoUrl}
                                            alt={selectedCandidate.username}
                                            className="h-14 w-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-base font-semibold text-slate-700">
                                            {initials(selectedCandidate.username)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-base font-semibold text-slate-900">{selectedCandidate.username}</p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {[selectedCandidate.age ? `${selectedCandidate.age} years old` : null, selectedCandidate.gender ?? null]
                                                .filter(Boolean)
                                                .join(' • ') || 'Basic profile'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">{selectedCandidate.location || 'Location hidden'}</p>
                                        <p className="mt-2 text-xs text-slate-500">Profile ID: {selectedCandidate.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button type="button" disabled={isActionLoading} onClick={() => runAction('like')}>
                                    <Heart className="h-4 w-4" />
                                    Like
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isActionLoading}
                                    onClick={() => runAction('dislike')}
                                >
                                    <UserRoundX className="h-4 w-4" />
                                    Dislike
                                </Button>
                            </div>

                            {actionStatus ? <p className="text-sm text-slate-700">{actionStatus}</p> : null}
                        </div>
                    )}
                </AppSectionCard>
            </div>

            <AppSectionCard title="Existing Matches" description="Loaded from /api/match/list.">
                <QueryState
                    isLoading={existingMatchesQuery.isLoading}
                    isError={existingMatchesQuery.isError}
                    error={existingMatchesQuery.error}
                    isEmpty={!existingMatchesQuery.isLoading && !existingMatchesQuery.isError && existingMatches.length === 0}
                    emptyMessage="No matches yet."
                    loadingMessage="Loading existing matches..."
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {existingMatches.map((item) => (
                            <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                                <div className="flex items-start gap-2">
                                    {item.photoUrl ? (
                                        <img
                                            src={item.photoUrl}
                                            alt={item.username}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent-warm)] text-xs font-semibold text-slate-700">
                                            {initials(item.username)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{item.username}</p>
                                        <p className="text-xs text-slate-500">
                                            {[item.age ? `${item.age} yrs` : null, item.location ?? null]
                                                .filter(Boolean)
                                                .join(' • ') || 'Details unavailable'}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </QueryState>
            </AppSectionCard>
        </AppPageShell>
    )
}
