'use client'

import { useMemo, useState } from 'react'
import { Heart, Loader2, MapPin, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import type { MatchActionRequest, MatchCandidate } from '@/entities/match/model/types'
import {
    useDiscoverMatchesQuery,
    useMatchActionMutation,
} from '@/entities/match/api/client/endpoints'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

const DEFAULT_DISCOVER_PER_PAGE = 12

const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
        const maybeMessage = (error as { data?: { message?: string } }).data?.message
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
            return maybeMessage
        }

        const nestedMessage =
            (error as { error?: string }).error ?? (error as { message?: string }).message

        if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
            return nestedMessage
        }
    }

    return 'Unable to process request right now'
}

const getCardSubtitle = (candidate: MatchCandidate): string => {
    const parts: string[] = []

    if (candidate.location) {
        parts.push(candidate.location)
    }

    if (typeof candidate.rating === 'number') {
        parts.push(`Rating ${candidate.rating}`)
    }

    return parts.join(' • ') || 'Discover profile'
}

function DiscoverCard({
    candidate,
    isPending,
    activeDot,
    dotCount,
    onAction,
}: {
    candidate: MatchCandidate
    isPending: boolean
    activeDot: number
    dotCount: number
    onAction: (payload: MatchActionRequest) => Promise<void>
}) {
    const handleLike = async () => {
        await onAction({ userId: candidate.id, action: 'like' })
    }

    const handleDislike = async () => {
        await onAction({ userId: candidate.id, action: 'dislike' })
    }

    const handleStar = () => {
        toast.info('Super like is not available yet')
    }

    return (
        <div className="mx-auto w-full max-w-sm">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-border bg-card shadow-lg">
                {candidate.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={candidate.photoUrl}
                        alt={`${candidate.username} profile photo`}
                        className="absolute inset-0 h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-amber-300 to-orange-200" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <MapPin className="size-3" />
                    {candidate.location ?? 'Nearby'}
                </div>

                <div className="absolute bottom-5 right-4 z-10 flex flex-col gap-3">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="size-11 rounded-full bg-white/85 text-zinc-700 hover:bg-white"
                        onClick={handleDislike}
                        disabled={isPending}
                        aria-label="Nope"
                    >
                        {isPending ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <X className="size-5" />
                        )}
                    </Button>

                    <Button
                        size="icon"
                        variant="secondary"
                        className="size-11 rounded-full bg-white/85 text-zinc-700 hover:bg-white"
                        onClick={handleStar}
                        disabled={isPending}
                        aria-label="Super like"
                    >
                        <Star className="size-5" />
                    </Button>

                    <Button
                        size="icon"
                        className="size-12 rounded-full bg-rose-500 text-white hover:bg-rose-600"
                        onClick={handleLike}
                        disabled={isPending}
                        aria-label="Like"
                    >
                        {isPending ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <Heart className="size-5 fill-current" />
                        )}
                    </Button>
                </div>

                <div className="absolute bottom-4 left-4 right-20 z-10 text-white">
                    <h3 className="text-3xl font-bold leading-tight">
                        {candidate.username}
                        {candidate.age ? `, ${candidate.age}` : ''}
                    </h3>
                    <p className="mt-1 text-sm text-white/90">{getCardSubtitle(candidate)}</p>
                </div>

                <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                    {Array.from({ length: dotCount }).map((_, idx) => (
                        <span
                            key={idx}
                            className={`h-1.5 rounded-full transition-all ${
                                idx === activeDot ? 'w-5 bg-white' : 'w-1.5 bg-white/55'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function MatchPage() {
    const [activeUserId, setActiveUserId] = useState<number | null>(null)
    const [page, setPage] = useState(0)
    const [cursor, setCursor] = useState(0)

    const { data, isLoading, error, refetch } = useDiscoverMatchesQuery({
        page,
        perPage: DEFAULT_DISCOVER_PER_PAGE,
    })
    const [submitAction] = useMatchActionMutation()

    const items = useMemo(() => data?.items ?? [], [data?.items])
    const currentCandidate = items[cursor]

    const advanceCard = async () => {
        const nextCursor = cursor + 1

        if (nextCursor < items.length) {
            setCursor(nextCursor)
            return
        }

        const totalPages = data?.totalPages
        if (typeof totalPages === 'number' && page + 1 < totalPages) {
            setPage((prev) => prev + 1)
            setCursor(0)
            return
        }

        await refetch()
        setCursor(0)
    }

    const handleAction = async (payload: MatchActionRequest): Promise<void> => {
        setActiveUserId(payload.userId)

        try {
            const result = await submitAction(payload).unwrap()

            if (result.isMatch) {
                toast.success("It's a match!")
            }

            await advanceCard()
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setActiveUserId(null)
        }
    }

    return (
        <section className="py-8 sm:pb-12">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">Start Matching</CardTitle>
                    <CardDescription>
                        Discover new profiles and choose Like or Nope.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-8 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Loading discover cards...
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Failed to load discover cards</AlertTitle>
                            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
                        </Alert>
                    ) : currentCandidate ? (
                        <DiscoverCard
                            candidate={currentCandidate}
                            isPending={activeUserId === currentCandidate.id}
                            activeDot={items.length ? cursor % Math.min(items.length, 5) : 0}
                            dotCount={Math.min(Math.max(items.length, 1), 5)}
                            onAction={handleAction}
                        />
                    ) : (
                        <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                            No discover profiles available right now.
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    )
}
