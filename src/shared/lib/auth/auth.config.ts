import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../database/prisma'
import { getEnvVar } from '@/shared/utils/get-env-var'
import { sendWelcomeEmail } from '@/shared/lib/email/mailer'

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    databaseHooks: {
        user: {
            create: {
                async after(user) {
                    const email = user.email?.trim().toLowerCase()
                    if (!email || email.endsWith('@pairengine.local')) {
                        return
                    }

                    const username = user.name?.trim() || email.split('@')[0]

                    try {
                        await sendWelcomeEmail({
                            email: user.email,
                            username,
                        })
                    } catch (error) {
                        console.error('[BetterAuth] Failed to send welcome email', {
                            userId: user.id,
                            email: user.email,
                            error,
                        })
                    }
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    // socialProviders: {
    //     google: {
    //         clientId: getEnvVar('GOOGLE_CLIENT_ID'),
    //         clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
    //         enabled: Boolean(getEnvVar('GOOGLE_CLIENT_ID') && getEnvVar('GOOGLE_CLIENT_SECRET')),
    //     },
    // },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    secret: getEnvVar('BETTER_AUTH_SECRET'),
    baseURL: getEnvVar('BETTER_AUTH_URL'),
    // Add email verification config when ready:
    // emailVerification: {
    //     sendVerificationEmail: async ({ user, url }) => {
    //         // Send email using your email service (Resend, SendGrid, etc.)
    //         console.log('Verification email:', { user: user.email, url })
    //     },
    // },
})

export type Session = typeof auth.$Infer.Session
