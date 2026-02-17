import 'server-only'
import { inject, injectable } from 'inversify'
import crypto from 'node:crypto'
import type { IPaymentTokenRepository } from '../interfaces/payment-token-repository.interface'
import type { ICreditRepository } from '@/entities/credit/api/server/interfaces/credit-repository.interface'
import { AppError } from '@/shared/errors/app-error'
import type { PaymentTokenStatus } from '../../../model/types'
import { mapGatewayStatus } from './update-payment-from-return.usecase'
import type { IUserRepository } from '@/entities/user/api/server/interfaces/user-repository.interface'
import { DI_TOKENS } from '@/shared/lib/di/tokens'
import { sendPaymentSuccessEmail } from '@/shared/lib/email/mailer'

const SECURE_PROCESSOR_PUBLIC_KEY = process.env.SECURE_PROCESSOR_PUBLIC_KEY

type HandleWebhookInput = {
    rawBody: string
    signature?: string | null
}

type WebhookPayload = {
    status?: string
    uid?: string
    payment_token_id?: string
    metadata?: {
        payment_token_id?: string
        user_id?: string
    }
}

const verifySignature = (payload: string, signature: string, publicKey: string): boolean => {
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(payload)
    verifier.end()
    return verifier.verify(publicKey, signature, 'base64')
}

const shouldFailTransaction = (status: PaymentTokenStatus) => {
    return ['FAILED', 'DECLINED', 'EXPIRED', 'ERROR'].includes(status)
}

@injectable()
export class HandlePaymentWebhookUseCase {
    constructor(
        @inject('IPaymentTokenRepository') private paymentTokenRepo: IPaymentTokenRepository,
        @inject('ICreditRepository') private creditRepo: ICreditRepository,
        @inject(DI_TOKENS.UserRepository) private userRepo: IUserRepository,
    ) {}

    async execute(input: HandleWebhookInput) {
        if (SECURE_PROCESSOR_PUBLIC_KEY) {
            if (!input.signature) {
                throw AppError.authorizationError('Missing webhook signature')
            }

            const publicKey = SECURE_PROCESSOR_PUBLIC_KEY.replace(/\\n/g, '\n')
            const isValid = verifySignature(
                input.rawBody,
                input.signature,
                publicKey,
            )

            if (!isValid) {
                throw AppError.authorizationError('Invalid webhook signature')
            }
        }

        let payload: WebhookPayload

        try {
            payload = JSON.parse(input.rawBody) as WebhookPayload
        } catch {
            throw AppError.validationError('Invalid webhook payload')
        }

        const paymentTokenId = payload.payment_token_id ?? payload.metadata?.payment_token_id

        if (!paymentTokenId) {
            throw AppError.validationError('Missing payment token id')
        }

        const status = mapGatewayStatus(payload.status)

        const existingToken = await this.paymentTokenRepo.findById(paymentTokenId)
        if (!existingToken) {
            throw AppError.notFoundError('Payment token not found')
        }

        const paymentToken = await this.paymentTokenRepo.update(paymentTokenId, {
            status,
            gatewayUid: payload.uid ?? null,
            rawPayload: payload,
        })

        const transaction = await this.creditRepo.findTransactionByPaymentTokenId(paymentTokenId)
        if (!transaction) {
            throw AppError.notFoundError('Credit transaction not found')
        }

        if (status === 'SUCCESSFUL') {
            if (transaction.status === 'SUCCESSFUL') {
                return { paymentToken, transaction }
            }

            const credits = await this.creditRepo.getOrCreateBalance(transaction.userId)
            const newBalance = credits.balance + transaction.amount
            await this.creditRepo.updateBalance(transaction.userId, newBalance)

            await this.creditRepo.updateTransactionStatus(transaction.id, 'SUCCESSFUL')

            const user = await this.userRepo.findById(transaction.userId)
            if (user?.email) {
                try {
                    await sendPaymentSuccessEmail({
                        email: user.email,
                        credits: transaction.amount,
                    })
                } catch (error) {
                    console.error('[HandlePaymentWebhookUseCase] Failed to send payment success email', {
                        userId: transaction.userId,
                        paymentTokenId,
                        error,
                    })
                }
            }

            return { paymentToken, transaction: { ...transaction, status: 'SUCCESSFUL' } }
        }

        if (shouldFailTransaction(status) && transaction.status !== 'SUCCESSFUL') {
            await this.creditRepo.updateTransactionStatus(transaction.id, 'FAILED')
            return { paymentToken, transaction: { ...transaction, status: 'FAILED' } }
        }

        return { paymentToken, transaction }
    }
}
