'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Mail, MapPin, UserCircle } from 'lucide-react'
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/entities/user/api/client/endpoints'
import { AppPageShell, AppSectionCard, QueryState, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const formatDate = (value?: string): string => {
    if (!value) return 'Unknown'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}

const profileMetaItems = [
    { label: 'Age', key: 'age' as const },
    { label: 'Gender', key: 'gender' as const },
    { label: 'Height', key: 'height' as const },
    { label: 'Weight', key: 'weight' as const },
    { label: 'Education', key: 'education' as const },
    { label: 'Profession', key: 'profession' as const },
]

export default function ProfilePage() {
    const profileQuery = useGetUserProfileQuery()
    const [updateProfile, { isLoading: isSaving }] = useUpdateUserProfileMutation()

    const profile = profileQuery.data?.user

    const [fullNameDraft, setFullNameDraft] = useState<string | null>(null)
    const [emailDraft, setEmailDraft] = useState<string | null>(null)
    const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null)

    const [formError, setFormError] = useState<string | null>(null)
    const [formSuccess, setFormSuccess] = useState<string | null>(null)

    const fullName = fullNameDraft ?? profile?.fullName ?? profile?.username ?? ''
    const email = emailDraft ?? profile?.email ?? ''
    const description = descriptionDraft ?? profile?.description ?? ''

    const readonlyMeta = useMemo(() => {
        if (!profile) return []

        return profileMetaItems
            .map((item) => ({
                label: item.label,
                value: profile[item.key],
            }))
            .filter((item) => item.value !== undefined && item.value !== null)
    }, [profile])

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedFullName = fullName.trim()
        if (!normalizedFullName) {
            setFormError('Full name is required.')
            setFormSuccess(null)
            return
        }

        setFormError(null)
        setFormSuccess(null)

        const result = await updateProfile({
            fullName: normalizedFullName,
            email: email.trim() || undefined,
            description: description.trim() || undefined,
        })

        if ('error' in result) {
            setFormError(getErrorMessage(result.error, 'Failed to save profile settings.'))
            return
        }

        setFormSuccess('Profile settings updated successfully.')
        setFullNameDraft(null)
        setEmailDraft(null)
        setDescriptionDraft(null)
        void profileQuery.refetch()
    }

    return (
        <AppPageShell
            title="Personal Settings"
            description="Update core profile settings and review account preferences from your current profile data."
        >
            <QueryState
                isLoading={profileQuery.isLoading}
                isError={profileQuery.isError}
                error={profileQuery.error}
                isEmpty={!profileQuery.isLoading && !profileQuery.isError && !profile}
                emptyMessage="Profile information is not available yet."
                loadingMessage="Loading profile..."
            >
                {profile ? (
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                        <AppSectionCard title="Profile Settings" description="Editable fields synced with /api/user/profile.">
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="fullName" className="text-sm font-medium text-slate-800">
                                        Full name
                                    </label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(event) => setFullNameDraft(event.target.value)}
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-800">
                                        Email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmailDraft(event.target.value)}
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium text-slate-800">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(event) => setDescriptionDraft(event.target.value)}
                                        rows={4}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                        placeholder="Share a short intro"
                                    />
                                </div>

                                {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                                {formSuccess ? <p className="text-sm text-emerald-700">{formSuccess}</p> : null}

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save settings'}
                                    </Button>
                                </div>
                            </form>
                        </AppSectionCard>

                        <div className="space-y-6">
                            <AppSectionCard title="Account Overview" description="Read-only account and profile metadata.">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        {profile.avatarUrl ? (
                                            <img
                                                src={profile.avatarUrl}
                                                alt={profile.username}
                                                className="h-14 w-14 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--accent-warm)] text-[var(--accent)]">
                                                <UserCircle className="h-7 w-7" />
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-base font-semibold text-slate-900">{profile.username}</p>
                                            <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {profile.location || 'Location hidden'}
                                            </p>
                                            <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                <Mail className="h-3.5 w-3.5" />
                                                {profile.email || 'Email not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        {readonlyMeta.length === 0 ? (
                                            <p className="text-sm text-slate-500">No additional preferences available.</p>
                                        ) : (
                                            readonlyMeta.map((item) => (
                                                <div key={item.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                                    <span className="text-xs text-slate-500">{item.label}</span>
                                                    <span className="text-sm font-medium text-slate-800">{String(item.value)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                        <p className="text-xs text-slate-500">Last visit</p>
                                        <p className="text-sm font-medium text-slate-800">{formatDate(profile.lastVisit)}</p>
                                    </div>
                                </div>
                            </AppSectionCard>

                            <AppSectionCard title="Profile Photos" description="Preview currently available photo slots.">
                                {profile.photos?.length ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {profile.photos.slice(0, 6).map((photo, index) => (
                                            <div key={`${photo.large || photo.medium || photo.small || index}`} className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                                {photo.large || photo.medium || photo.small ? (
                                                    <img
                                                        src={photo.large || photo.medium || photo.small}
                                                        alt={`Profile ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No photos available.</p>
                                )}
                            </AppSectionCard>
                        </div>
                    </div>
                ) : null}
            </QueryState>
        </AppPageShell>
    )
}
