import { NextRequest } from 'next/server'
import { AppError } from '@/shared/errors/app-error'
import { prisma } from '@/shared/lib/database/prisma'
import { getSession } from './get-session'

const toShadowUserId = (datingUserId: string): string => `dating:${datingUserId}`

const ensureShadowUser = async (datingUserId: string): Promise<string> => {
    const userId = toShadowUserId(datingUserId)

    await prisma.user.upsert({
        where: { id: userId },
        update: {
            updatedAt: new Date(),
        },
        create: {
            id: userId,
            name: `Dating User ${datingUserId}`,
            email: `dating-user-${datingUserId}@pairengine.local`,
            emailVerified: false,
            image: null,
        },
    })

    return userId
}

export const resolveAppUserId = async (request: NextRequest): Promise<string> => {
    const session = await getSession()
    const userId = session?.user?.id

    if (userId) {
        return userId
    }

    const datingUserId = request.cookies.get('dating_user_id')?.value?.trim()
    if (datingUserId) {
        return ensureShadowUser(datingUserId)
    }

    throw AppError.authenticationError()
}
