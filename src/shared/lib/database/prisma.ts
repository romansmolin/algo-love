import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaPool: Pool | undefined
}

const resolveDatabaseConnectionString = (): string => {
    const databaseUrl = process.env.DATABASE_URL?.trim()
    const prismaDatabaseUrl = process.env.PRISMA_DATABASE_URL?.trim()

    // For PrismaPg adapter we need a Postgres connection string.
    // Prefer DATABASE_URL, and only use PRISMA_DATABASE_URL when it is also a Postgres DSN.
    if (databaseUrl) {
        return databaseUrl
    }

    if (prismaDatabaseUrl && !prismaDatabaseUrl.startsWith('prisma://')) {
        return prismaDatabaseUrl
    }

    throw new Error('DATABASE_URL must be set to a PostgreSQL connection string')
}

export const prisma =
    globalForPrisma.prisma ??
    (() => {
        const connectionString = resolveDatabaseConnectionString()

        const pool =
            globalForPrisma.prismaPool ??
            new Pool({
                connectionString,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000,
            })

        const adapter = new PrismaPg(pool)

        if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaPool = pool

        return new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        })
    })()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
