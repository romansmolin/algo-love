import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authService } from '@/shared/lib/auth/external-auth.service'
import { getClientIp } from '@/shared/http/get-client-ip'
import { setSessionCookies } from '@/shared/lib/auth/session-cookies'
import { AppError, FieldError } from '@/shared/errors/app-error'
import { asyncHandler } from '@/shared/http/async-handler'
import { GENDER_VALUES, LOOKING_FOR_VALUES } from '@/shared/lib/auth/external-auth.types'
import { sendWelcomeEmail } from '@/shared/lib/email/mailer'

const signUpBodySchema = z.object({
    username: z.string().trim().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    email: z.string().trim().email('Invalid email address'),
    gender: z.enum(GENDER_VALUES),
    lookingFor: z.enum(LOOKING_FOR_VALUES),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    city: z.preprocess(
        (value) => {
            if (typeof value !== 'string') return value
            const trimmed = value.trim()
            return trimmed === '' ? undefined : trimmed
        },
        z
            .string()
            .regex(/^\d+$/, 'City must be numeric')
            .optional(),
    ),
})

const methodNotAllowed = () => NextResponse.json({ error: { message: 'Method not allowed' } }, { status: 405 })

export const GET = methodNotAllowed
export const PUT = methodNotAllowed
export const PATCH = methodNotAllowed
export const DELETE = methodNotAllowed

export const POST = asyncHandler(async (request: NextRequest) => {
    let body: unknown

    try {
        body = await request.json()
    } catch {
        throw AppError.validationError('Invalid JSON payload')
    }

    const parsed = signUpBodySchema.safeParse(body)

    if (!parsed.success) {
        const fields: FieldError[] = parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }))

        throw AppError.validationError('Invalid sign-up payload', fields)
    }

    const userAgent = request.headers.get('user-agent') ?? undefined
    const ipAddress = getClientIp(request)

    const result = await authService.signUp({
        ...parsed.data,
        userAgent,
        ipAddress,
    })

    const response = NextResponse.json({
        accepted: result.accepted,
        sessionId: result.sessionId,
        userId: result.userId,
        lang: result.lang,
    })

    setSessionCookies(response, {
        sessionId: result.sessionId,
        userId: result.userId,
        lang: result.lang,
    })

    try {
        await sendWelcomeEmail({
            email: parsed.data.email,
            username: parsed.data.username,
        })
    } catch (error) {
        console.error('[AuthSignUp] Failed to send welcome email', {
            userId: result.userId,
            error,
        })
    }

    return response
})
