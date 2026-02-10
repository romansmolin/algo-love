'use client'

import {
    Activity,
    AlertCircle,
    Cake,
    Camera,
    Eye,
    Loader2,
    MapPin,
    PencilLine,
    Star,
    ThumbsUp,
    Trophy,
    UserRound,
    Users,
    type LucideIcon,
} from 'lucide-react'
import {
    type ActivityAction,
    type CommunityActivityItem,
    type MemberSummary,
} from '@/entities/dashboard/model/types'
import {
    useGetCommunityActivityQuery,
    useGetRecentVisitorsQuery,
    useGetTopMembersQuery,
} from '@/entities/dashboard/api/client/endpoints'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type ActivityMeta = {
    label: string
    icon: LucideIcon
}

const activityMeta: Record<ActivityAction, ActivityMeta> = {
    con: { label: 'Connected', icon: Activity },
    visite: { label: 'Visited', icon: Eye },
    vote: { label: 'Voted', icon: ThumbsUp },
    modif: { label: 'Updated profile', icon: PencilLine },
    add_tof: { label: 'Added photo', icon: Camera },
    birthday: { label: 'Birthday', icon: Cake },
    friends: { label: 'New friend', icon: Users },
}

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

    return 'Unable to load data right now'
}

const renderGender = (gender?: MemberSummary['gender']): string | null => {
    if (!gender) return null
    if (gender === 'man') return 'Man'
    if (gender === 'woman') return 'Woman'
    return 'Couple'
}

function LoadingState({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            {message}
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            {message}
        </div>
    )
}

function ErrorState({ message }: { message: string }) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Failed to load</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    )
}

function CommunityActivityList({ items }: { items: CommunityActivityItem[] }) {
    return (
        <ul className="space-y-3">
            {items.map((item) => {
                const meta = activityMeta[item.action]
                const Icon = meta.icon

                return (
                    <li
                        key={`${item.action}-${item.id}`}
                        className="rounded-xl border border-border bg-card p-4"
                    >
                        <div className="flex items-start gap-3">
                            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Icon className="size-4" />
                            </span>

                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold">{item.username}</p>
                                    <Badge variant="outline">{meta.label}</Badge>
                                    {item.gender ? (
                                        <Badge variant="secondary">
                                            {renderGender(item.gender)}
                                        </Badge>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    {item.location ? (
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="size-3.5" />
                                            {item.location}
                                        </span>
                                    ) : null}
                                    {item.timestamp ? <span>{item.timestamp}</span> : null}
                                </div>
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

function MemberList({
    items,
    icon: Icon,
    badgeLabel,
}: {
    items: MemberSummary[]
    icon: LucideIcon
    badgeLabel: string
}) {
    return (
        <ul className="space-y-3">
            {items.map((member) => (
                <li key={member.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                        <Avatar size="lg" className="ring-border ring-1">
                            <AvatarImage src={member.photoUrl} alt={`${member.username} photo`} />
                            <AvatarFallback>
                                <Icon className="size-4" />
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold">{member.username}</p>
                                <Badge variant="outline" className="gap-1">
                                    <Icon className="size-3" />
                                    {badgeLabel}
                                </Badge>
                                {member.gender ? (
                                    <Badge variant="secondary">{renderGender(member.gender)}</Badge>
                                ) : null}
                                {typeof member.age === 'number' ? (
                                    <Badge variant="outline">{member.age} y/o</Badge>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                {member.location ? (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="size-3.5" />
                                        {member.location}
                                    </span>
                                ) : null}

                                {typeof member.rating === 'number' ? (
                                    <span className="inline-flex items-center gap-1">
                                        <Star className="size-3.5" />
                                        {member.rating}
                                    </span>
                                ) : null}

                                {member.visitedAt ? <span>{member.visitedAt}</span> : null}
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export function DashboardPage() {
    const activityQuery = useGetCommunityActivityQuery()
    const topMembersQuery = useGetTopMembersQuery({ gender: 'men' })
    const recentVisitorsQuery = useGetRecentVisitorsQuery()

    return (
        <section className="container mx-auto px-4 py-8 sm:px-6 sm:pb-12 lg:px-8">
            <div className="mx-auto w-full max-w-5xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl sm:text-3xl">Dashboard</CardTitle>
                        <CardDescription>
                            Community feed, top members, and your most recent profile visitors.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue="community-activity">
                            <TabsList className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                <TabsTrigger value="community-activity">
                                    <Activity className="size-4" />
                                    Community Activity
                                </TabsTrigger>
                                <TabsTrigger value="top-members">
                                    <Trophy className="size-4" />
                                    Top Members
                                </TabsTrigger>
                                <TabsTrigger value="recent-visitors">
                                    <UserRound className="size-4" />
                                    Recent Visitors
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="community-activity">
                                {activityQuery.isLoading ? (
                                    <LoadingState message="Loading community activity..." />
                                ) : activityQuery.error ? (
                                    <ErrorState message={getErrorMessage(activityQuery.error)} />
                                ) : activityQuery.data?.items?.length ? (
                                    <CommunityActivityList items={activityQuery.data.items} />
                                ) : (
                                    <EmptyState message="No community activity yet." />
                                )}
                            </TabsContent>

                            <TabsContent value="top-members">
                                {topMembersQuery.isLoading ? (
                                    <LoadingState message="Loading top members..." />
                                ) : topMembersQuery.error ? (
                                    <ErrorState message={getErrorMessage(topMembersQuery.error)} />
                                ) : topMembersQuery.data?.items?.length ? (
                                    <MemberList
                                        items={topMembersQuery.data.items}
                                        icon={Trophy}
                                        badgeLabel="Top member"
                                    />
                                ) : (
                                    <EmptyState message="No top members found." />
                                )}
                            </TabsContent>

                            <TabsContent value="recent-visitors">
                                {recentVisitorsQuery.isLoading ? (
                                    <LoadingState message="Loading recent visitors..." />
                                ) : recentVisitorsQuery.error ? (
                                    <ErrorState
                                        message={getErrorMessage(recentVisitorsQuery.error)}
                                    />
                                ) : recentVisitorsQuery.data?.items?.length ? (
                                    <MemberList
                                        items={recentVisitorsQuery.data.items}
                                        icon={Eye}
                                        badgeLabel="Visitor"
                                    />
                                ) : (
                                    <EmptyState message="No recent visitors yet." />
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
