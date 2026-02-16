'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignUpMutation, signUpSchema, type SignUpDto } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/css/utils'
import { parseMutationError } from './mutation-error'

export type SignUpFormProps = {
    variant: 'auth-page' | 'landing'
    onSuccessRedirect?: string
    submitLabel?: string
}

const KNOWN_SIGN_UP_FIELDS = new Set<keyof SignUpDto>([
    'username',
    'password',
    'email',
    'gender',
    'lookingFor',
    'dateOfBirth',
    'consentAccepted',
])

export function SignUpForm({
    variant,
    onSuccessRedirect = '/dashboard',
    submitLabel = 'Create account',
}: SignUpFormProps) {
    const router = useRouter()
    const [signUp, { isLoading }] = useSignUpMutation()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<SignUpDto>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            password: '',
            email: '',
            gender: 'man',
            lookingFor: 'women',
            dateOfBirth: '',
            consentAccepted: false,
        },
    })

    const onSubmit = async (data: SignUpDto) => {
        clearErrors('root')

        const result = await signUp(data)

        if ('error' in result) {
            const parsed = parseMutationError(result.error, 'Sign up failed')
            setError('root.server', { message: parsed.message })

            for (const fieldError of parsed.fields ?? []) {
                if (KNOWN_SIGN_UP_FIELDS.has(fieldError.field as keyof SignUpDto)) {
                    setError(fieldError.field as keyof SignUpDto, {
                        type: 'server',
                        message: fieldError.message,
                    })
                }
            }

            return
        }

        router.push(onSuccessRedirect)
    }

    const isLanding = variant === 'landing'

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="sign-up-form">
            {errors.root?.server?.message ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errors.root.server.message}
                </p>
            ) : null}

            <div className={cn('grid gap-4', isLanding ? 'sm:grid-cols-2' : '')}>
                <div className="space-y-2">
                    <label htmlFor={`signup-username-${variant}`} className="text-sm font-medium text-slate-800">
                        Username
                    </label>
                    <Input
                        id={`signup-username-${variant}`}
                        type="text"
                        autoComplete="username"
                        placeholder="john_doe"
                        {...register('username')}
                        data-testid="username-input"
                    />
                    {errors.username ? <p className="text-xs text-red-600">{errors.username.message}</p> : null}
                </div>

                <div className="space-y-2">
                    <label htmlFor={`signup-email-${variant}`} className="text-sm font-medium text-slate-800">
                        Email
                    </label>
                    <Input
                        id={`signup-email-${variant}`}
                        type="email"
                        autoComplete="email"
                        placeholder="john@example.com"
                        {...register('email')}
                        data-testid="email-input"
                    />
                    {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                    <label htmlFor={`signup-password-${variant}`} className="text-sm font-medium text-slate-800">
                        Password
                    </label>
                    <Input
                        id={`signup-password-${variant}`}
                        type="password"
                        placeholder="At least 8 chars, upper/lower/number"
                        {...register('password')}
                        data-testid="password-input"
                    />
                    {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
                </div>

                <div className="space-y-2">
                    <label htmlFor={`signup-gender-${variant}`} className="text-sm font-medium text-slate-800">
                        Gender
                    </label>
                    <select
                        id={`signup-gender-${variant}`}
                        {...register('gender')}
                        className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        data-testid="gender-select"
                    >
                        <option value="man">Man</option>
                        <option value="woman">Woman</option>
                        <option value="non_binary">Non-binary</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.gender ? <p className="text-xs text-red-600">{errors.gender.message}</p> : null}
                </div>

                <div className="space-y-2">
                    <label htmlFor={`signup-lookingfor-${variant}`} className="text-sm font-medium text-slate-800">
                        Looking for
                    </label>
                    <select
                        id={`signup-lookingfor-${variant}`}
                        {...register('lookingFor')}
                        className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        data-testid="looking-for-select"
                    >
                        <option value="man">Man</option>
                        <option value="women">Women</option>
                        <option value="couple">Couple</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.lookingFor ? <p className="text-xs text-red-600">{errors.lookingFor.message}</p> : null}
                </div>

                <div className="space-y-2">
                    <label htmlFor={`signup-dob-${variant}`} className="text-sm font-medium text-slate-800">
                        Date of birth
                    </label>
                    <Input
                        id={`signup-dob-${variant}`}
                        type="date"
                        {...register('dateOfBirth')}
                        data-testid="date-of-birth-input"
                    />
                    {errors.dateOfBirth ? <p className="text-xs text-red-600">{errors.dateOfBirth.message}</p> : null}
                </div>

            </div>

            <div className="space-y-2">
                <label className="inline-flex items-start gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                        {...register('consentAccepted')}
                        data-testid="sign-up-consent-checkbox"
                    />
                    <span>
                        I agree to the{' '}
                        <Link href="/terms-of-service" className="underline hover:text-slate-900" data-testid="sign-up-terms-link">
                            Terms of Service
                        </Link>
                        ,{' '}
                        <Link href="/privacy-policy" className="underline hover:text-slate-900" data-testid="sign-up-privacy-link">
                            Privacy Policy
                        </Link>
                        , and{' '}
                        <Link href="/return-policy" className="underline hover:text-slate-900" data-testid="sign-up-return-link">
                            Return Policy
                        </Link>
                        .
                    </span>
                </label>
                {errors.consentAccepted ? (
                    <p className="text-xs text-red-600">{errors.consentAccepted.message}</p>
                ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    <>
                        <UserPlus className="h-4 w-4" />
                        {submitLabel}
                    </>
                )}
            </Button>
        </form>
    )
}
