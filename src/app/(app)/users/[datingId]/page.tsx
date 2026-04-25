'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Heart,
    HeartHandshake,
    MessageCircle,
    SkipForward,
    UserRoundX,
} from 'lucide-react'
import { useGetUserDetailsQuery } from '@/entities/user/api/client/endpoints'
import { useMatchActionMutation } from '@/entities/match/api/client/endpoints'
import type { UserInteractionState, UserProfile } from '@/entities/user/model/types'
import type { MatchAction } from '@/entities/match/model/types'
import { AppPageShell, AppSectionCard, QueryState, getErrorMessage } from '@/components/app'
import { MatchRadarPanel } from '@/components/ai'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/css/utils'

const initials = (name: string): string => {
    const normalized = name.trim()
    if (!normalized) return 'U'
    const parts = normalized.split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

const stateLabels: Record<UserInteractionState, { label: string; tone: string }> = {
    none: { label: 'No interaction yet', tone: 'bg-slate-100 text-slate-700' },
    liked: { label: 'You liked them', tone: 'bg-rose-100 text-rose-700' },
    disliked: { label: 'You disliked them', tone: 'bg-zinc-200 text-zinc-700' },
    skipped: { label: 'You skipped them', tone: 'bg-amber-100 text-amber-800' },
    matched: { label: 'It’s a match', tone: 'bg-emerald-100 text-emerald-800' },
}

const detailRow = (label: string, value: string | number | undefined) => {
    if (value === undefined || value === '' || value === null) return null
    return (
        <div className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-900">{value}</span>
        </div>
    )
}

type Params = { datingId: string }

export default function UserDetailsPage({ params }: { params: Promise<Params> }) {
    const { datingId: rawId } = use(params)
    const datingId = Number.parseInt(rawId, 10)
    const isValid = Number.isFinite(datingId) && datingId > 0

    const router = useRouter()
    const query = useGetUserDetailsQuery(datingId, { skip: !isValid })
    const [matchAction, { isLoading: isActionLoading }] = useMatchActionMutation()
    const [actionStatus, setActionStatus] = useState<string | null>(null)

    if (!isValid) {
        return (
            <AppPageShell title="User profile" description="Invalid user id.">
                <p className="text-sm text-red-600">The provided id is not a positive integer.</p>
            </AppPageShell>
        )
    }

    const profile = query.data?.user
    const interactionState = query.data?.interactionState ?? 'none'

    const runAction = async (action: MatchAction) => {
        setActionStatus(null)

        const result = await matchAction({ userId: datingId, action })
        if ('error' in result) {
            setActionStatus(getErrorMessage(result.error, 'Could not apply match action.'))
            return
        }

        if (result.data.isMatch) {
            setActionStatus('It’s a match!')
        } else {
            setActionStatus(result.data.result || `${action} recorded.`)
        }

        await query.refetch()
    }

    return (
        <AppPageShell
            title={profile?.username ?? 'Loading profile…'}
            description={profile ? `Profile of ${profile.username} (#${datingId})` : 'Fetching profile…'}
        >
            <div className="-mt-2">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <QueryState
                isLoading={query.isLoading}
                isError={query.isError}
                error={query.error}
                loadingMessage="Loading profile…"
            >
                {profile ? (
                    <ProfileBody
                        profile={profile}
                        datingId={datingId}
                        interactionState={interactionState}
                        isActionLoading={isActionLoading}
                        actionStatus={actionStatus}
                        runAction={runAction}
                    />
                ) : null}
            </QueryState>
        </AppPageShell>
    )
}

type ProfileBodyProps = {
    profile: UserProfile
    datingId: number
    interactionState: UserInteractionState
    isActionLoading: boolean
    actionStatus: string | null
    runAction: (action: MatchAction) => Promise<void>
}

function ProfileBody({
    profile,
    datingId,
    interactionState,
    isActionLoading,
    actionStatus,
    runAction,
}: ProfileBodyProps) {
    const photos = profile.photos ?? []
    const heroPhoto =
        photos[0]?.large ?? photos[0]?.medium ?? photos[0]?.small ?? profile.avatarUrl
    const galleryPhotos = photos.slice(1, 6)
    const stateBadge = stateLabels[interactionState]

    return (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <AppSectionCard title="Photos" description={`${photos.length || 'No'} photos`}>
                {heroPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={heroPhoto}
                        alt={profile.username}
                        className="h-72 w-full rounded-2xl object-cover"
                    />
                ) : (
                    <div className="grid h-72 w-full place-items-center rounded-2xl bg-[var(--accent-warm)] text-3xl font-semibold text-slate-700">
                        {initials(profile.username)}
                    </div>
                )}

                {galleryPhotos.length > 0 ? (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                        {galleryPhotos.map((photo, index) => {
                            const src = photo.medium ?? photo.large ?? photo.small
                            if (!src) return null
                            return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={`${src}-${index}`}
                                    src={src}
                                    alt={`${profile.username} photo ${index + 2}`}
                                    className="h-20 w-full rounded-xl object-cover"
                                />
                            )
                        })}
                    </div>
                ) : null}
            </AppSectionCard>

            <div className="space-y-6">
                <AppSectionCard
                    title="About"
                    description={profile.location ?? undefined}
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium',
                                stateBadge.tone,
                            )}
                        >
                            {stateBadge.label}
                        </span>
                        {profile.age ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                                {profile.age} years old
                            </span>
                        ) : null}
                        {profile.gender ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                                {profile.gender}
                            </span>
                        ) : null}
                    </div>

                    {profile.description ? (
                        <p className="mt-4 whitespace-pre-line text-sm text-slate-700">
                            {profile.description}
                        </p>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">No bio provided.</p>
                    )}

                    <div className="mt-4">
                        {detailRow('Profile id', `#${datingId}`)}
                        {detailRow('Full name', profile.fullName)}
                        {detailRow('Height', profile.height ? `${profile.height} cm` : undefined)}
                        {detailRow('Weight', profile.weight ? `${profile.weight} kg` : undefined)}
                        {detailRow('Children', profile.children)}
                        {detailRow('Education', profile.education)}
                        {detailRow('Profession', profile.profession)}
                        {detailRow('Last visit', profile.lastVisit)}
                    </div>
                </AppSectionCard>

                <AppSectionCard title="Actions" description="Like, dislike, skip, or message.">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                            onClick={() => runAction('dislike')}
                        >
                            <UserRoundX className="h-4 w-4" />
                            Dislike
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
                            variant={interactionState === 'matched' ? 'default' : 'outline'}
                            disabled={interactionState !== 'matched' && interactionState !== 'liked'}
                            asChild
                        >
                            <Link href={`/chat?contactId=${datingId}`}>
                                <MessageCircle className="h-4 w-4" />
                                Message
                            </Link>
                        </Button>
                    </div>

                    {actionStatus ? (
                        <p className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                            <HeartHandshake className="h-4 w-4 text-[var(--accent)]" />
                            {actionStatus}
                        </p>
                    ) : null}
                </AppSectionCard>

                <MatchRadarPanel candidateDatingId={datingId} />
            </div>
        </div>
    )
}
