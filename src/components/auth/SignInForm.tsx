'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignInMutation, signInSchema, type SignInDto } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { parseMutationError } from './mutation-error'

const KNOWN_SIGN_IN_FIELDS = new Set<keyof SignInDto>(['username', 'password', 'rememberMe', 'consentAccepted'])

export function SignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [signIn, { isLoading }] = useSignInMutation()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<SignInDto>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: '',
            password: '',
            rememberMe: false,
            consentAccepted: false,
        },
    })

    const onSubmit = async (data: SignInDto) => {
        clearErrors('root')

        const result = await signIn(data)

        if ('error' in result) {
            const parsed = parseMutationError(result.error, 'Sign in failed')
            setError('root.server', { message: parsed.message })

            for (const fieldError of parsed.fields ?? []) {
                if (KNOWN_SIGN_IN_FIELDS.has(fieldError.field as keyof SignInDto)) {
                    setError(fieldError.field as keyof SignInDto, {
                        type: 'server',
                        message: fieldError.message,
                    })
                }
            }

            return
        }

        const next = searchParams.get('next')
        router.push(next && next.startsWith('/') ? next : '/dashboard')
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="sign-in-form">
            {errors.root?.server?.message ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errors.root.server.message}
                </p>
            ) : null}

            <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-slate-800">
                    Username
                </label>
                <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="john_doe"
                    {...register('username')}
                    data-testid="username-input"
                />
                {errors.username ? <p className="text-xs text-red-600">{errors.username.message}</p> : null}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="text-sm font-medium text-slate-800">
                        Password
                    </label>
                    <Link href="/forgot-password" className="text-xs text-slate-500 underline hover:text-slate-700">
                        Forgot password?
                    </Link>
                </div>
                <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register('password')}
                    data-testid="password-input"
                />
                {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
            </div>

            <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                        {...register('rememberMe')}
                    />
                    Remember me
                </label>
            </div>

            <div className="space-y-2">
                <label className="inline-flex items-start gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                        {...register('consentAccepted')}
                        data-testid="sign-in-consent-checkbox"
                    />
                    <span>
                        I agree to the{' '}
                        <Link href="/terms-of-service" className="underline hover:text-slate-900" data-testid="sign-in-terms-link">
                            Terms of Service
                        </Link>
                        ,{' '}
                        <Link href="/privacy-policy" className="underline hover:text-slate-900" data-testid="sign-in-privacy-link">
                            Privacy Policy
                        </Link>
                        , and{' '}
                        <Link href="/return-policy" className="underline hover:text-slate-900" data-testid="sign-in-return-link">
                            Return Policy
                        </Link>
                        .
                    </span>
                </label>
                {errors.consentAccepted ? <p className="text-xs text-red-600">{errors.consentAccepted.message}</p> : null}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    <>
                        <LogIn className="h-4 w-4" />
                        Sign in
                    </>
                )}
            </Button>
        </form>
    )
}
