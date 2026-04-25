import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { resolveAppUserId } from '@/shared/lib/auth/resolve-app-user-id'
import { AIUnlockService } from '../services/ai-unlock.service'

const purchaseSchema = z.object({
    productId: z.enum(['ai_unlock_1d', 'ai_unlock_3d', 'ai_unlock_7d']),
})

@injectable()
export class AIUnlockController {
    constructor(@inject(AIUnlockService) private service: AIUnlockService) {}

    async getStatus(request: NextRequest): Promise<NextResponse> {
        const userId = await resolveAppUserId(request)
        const status = await this.service.getStatus(userId)
        return NextResponse.json(status)
    }

    async listProducts(): Promise<NextResponse> {
        const products = this.service.listProducts()
        return NextResponse.json({ products })
    }

    async purchase(request: NextRequest): Promise<NextResponse> {
        const userId = await resolveAppUserId(request)

        let body: unknown
        try {
            body = await request.json()
        } catch {
            throw AppError.validationError('Invalid JSON payload')
        }

        const parsed = purchaseSchema.safeParse(body)
        if (!parsed.success) {
            throw AppError.validationError(
                'Invalid purchase payload',
                parsed.error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            )
        }

        const result = await this.service.purchase(userId, parsed.data.productId)
        return NextResponse.json(result)
    }
}
