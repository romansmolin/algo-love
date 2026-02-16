'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/css/utils'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

type AuthTab = 'signin' | 'signup'

function resolveTab(value: string | null): AuthTab {
    return value === 'signup' ? 'signup' : 'signin'
}

export function AuthTabsPage() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const activeTab = resolveTab(searchParams.get('tab'))
    const reason = searchParams.get('reason')

    const setTab = (tab: AuthTab) => {
        const params = new URLSearchParams(searchParams.toString())

        if (tab === 'signin') {
            params.delete('tab')
        } else {
            params.set('tab', 'signup')
        }

        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.replace(nextUrl, { scroll: false })
    }

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-2xl">
                <Card className="rounded-3xl">
                    <CardHeader className="space-y-4">
                        <CardTitle className="text-center text-2xl sm:text-3xl">AlgoLove Account</CardTitle>
                        <p className="text-center text-sm text-slate-600">
                            Sign in to continue, or create your profile to start compatibility-first dating.
                        </p>

                        {reason === 'session-expired' ? (
                            <p className="rounded-lg border border-[color:rgb(255_166_166_/_0.55)] bg-[var(--accent-warm)] px-3 py-2 text-sm text-slate-700">
                                Your session expired. Please sign in again.
                            </p>
                        ) : null}

                        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-1" role="tablist" aria-label="Authentication tabs">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'signin'}
                                onClick={() => setTab('signin')}
                                className={cn(
                                    'rounded-xl px-4 py-2 text-sm font-medium transition',
                                    activeTab === 'signin'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900',
                                )}
                            >
                                Sign in
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'signup'}
                                onClick={() => setTab('signup')}
                                className={cn(
                                    'rounded-xl px-4 py-2 text-sm font-medium transition',
                                    activeTab === 'signup'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900',
                                )}
                            >
                                Sign up
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {activeTab === 'signin' ? (
                            <div role="tabpanel" aria-label="Sign in panel" className="space-y-4">
                                <SignInForm />
                                <p className="text-center text-sm text-slate-600">
                                    Don&apos;t have an account?{' '}
                                    <Button type="button" variant="ghost" className="h-auto p-0" onClick={() => setTab('signup')}>
                                        Create one
                                    </Button>
                                </p>
                            </div>
                        ) : (
                            <div role="tabpanel" aria-label="Sign up panel" className="space-y-4">
                                <SignUpForm variant="auth-page" submitLabel="Create account" />
                                <p className="text-center text-sm text-slate-600">
                                    Already have an account?{' '}
                                    <Button type="button" variant="ghost" className="h-auto p-0" onClick={() => setTab('signin')}>
                                        Sign in
                                    </Button>
                                </p>
                            </div>
                        )}

                        <p className="mt-4 text-center text-xs text-slate-500">
                            By continuing, you agree to our <Link href="/terms-of-service" className="underline">Terms</Link> and{' '}
                            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
