export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/shared/lib/di/container.server'
import type { IPaymentTokenRepository } from '@/entities/payment/api/server/interfaces/payment-token-repository.interface'

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
    const { token } = await context.params

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const repo = container.get<IPaymentTokenRepository>('IPaymentTokenRepository')
    const record = await repo.findById(token)

    if (!record) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
        status: record.status,
        amountCents: record.amountCents,
        currency: record.currency,
        updatedAt: record.updatedAt,
    })
}
