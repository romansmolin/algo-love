import { inject, injectable } from 'inversify'
import type { ICreditRepository } from '../interfaces/credit-repository.interface'
import { AppError } from '@/shared/errors/app-error'
import { CreatePaymentCheckoutUseCase } from '@/entities/payment/api/server/use-cases/create-payment-checkout.usecase'

const COINS_PER_EUR = 30
const DEFAULT_CURRENCY = 'EUR'
const FIXED_PACKS = {
    1: 30,
    5: 230,
    10: 460,
} as const

type PresetKey = keyof typeof FIXED_PACKS

type PurchaseCreditsInput = {
    amountEur: number
    pricingMode?: 'preset' | 'custom'
    presetKey?: PresetKey
}

type PricingResolution = {
    amountEur: number
    amountCents: number
    grantedCredits: number
    pricingMode: 'preset' | 'custom'
    presetKey?: PresetKey
}

const isPresetKey = (value?: number): value is PresetKey => {
    return value === 1 || value === 5 || value === 10
}

const resolvePricing = (input: PurchaseCreditsInput): PricingResolution => {
    if (!Number.isFinite(input.amountEur) || input.amountEur <= 0) {
        throw AppError.validationError('amountEur must be a positive number')
    }

    if (Math.abs(input.amountEur * 100 - Math.round(input.amountEur * 100)) >= 1e-9) {
        throw AppError.validationError('amountEur can have at most 2 decimal places')
    }

    if (input.amountEur > 10_000) {
        throw AppError.validationError('amountEur is too large')
    }

    const mode = input.pricingMode ?? (input.presetKey !== undefined ? 'preset' : 'custom')

    if (mode === 'preset') {
        if (!isPresetKey(input.presetKey)) {
            throw AppError.validationError('presetKey must be one of: 1, 5, 10')
        }

        if (input.amountEur !== input.presetKey) {
            throw AppError.validationError('amountEur must match presetKey for preset pricing')
        }

        return {
            amountEur: input.amountEur,
            amountCents: Math.round(input.amountEur * 100),
            grantedCredits: FIXED_PACKS[input.presetKey],
            pricingMode: 'preset',
            presetKey: input.presetKey,
        }
    }

    if (input.presetKey !== undefined) {
        throw AppError.validationError('presetKey is not allowed for custom pricing')
    }

    const grantedCredits = Math.floor(input.amountEur * COINS_PER_EUR)

    if (grantedCredits <= 0) {
        throw AppError.validationError('amountEur is too small for coin purchase')
    }

    return {
        amountEur: input.amountEur,
        amountCents: Math.round(input.amountEur * 100),
        grantedCredits,
        pricingMode: 'custom',
    }
}

@injectable()
export class PurchaseCreditsUseCase {
    constructor(
        @inject('ICreditRepository') private creditRepo: ICreditRepository,
        @inject(CreatePaymentCheckoutUseCase)
        private paymentCheckoutUseCase: CreatePaymentCheckoutUseCase,
    ) {}

    async execute(userId: string, input: PurchaseCreditsInput) {
        const pricing = resolvePricing(input)

        if (pricing.amountCents > Number.MAX_SAFE_INTEGER) {
            throw AppError.validationError('amountEur is too large')
        }

        console.info('[PurchaseCreditsUseCase] Purchase request received', {
            amountEur: pricing.amountEur,
            amountCents: pricing.amountCents,
            grantedCredits: pricing.grantedCredits,
            pricingMode: pricing.pricingMode,
            presetKey: pricing.presetKey,
            currency: DEFAULT_CURRENCY,
        })

        await this.creditRepo.getOrCreateBalance(userId)

        const description = `Love coins purchase: ${pricing.grantedCredits} coins`

        const checkout = await this.paymentCheckoutUseCase.execute({
            userId,
            amountCents: pricing.amountCents,
            currency: DEFAULT_CURRENCY,
            description,
            metadata: {
                reference_id: `credits:${pricing.grantedCredits}`,
                amount_eur: pricing.amountEur.toFixed(2),
                granted_credits: String(pricing.grantedCredits),
                pricing_mode: pricing.pricingMode,
                ...(pricing.presetKey ? { preset_key: String(pricing.presetKey) } : {}),
            },
        })

        const paymentTokenId = checkout.paymentToken.id

        await this.creditRepo.createTransaction({
            userId,
            type: 'grant',
            amount: pricing.grantedCredits,
            status: 'PENDING',
            reason: description,
            paymentTokenId,
        })

        console.info('[PurchaseCreditsUseCase] Checkout token created', {
            paymentTokenId,
            hasRedirectUrl: Boolean(checkout.redirectUrl),
        })

        return {
            checkoutToken: checkout.checkoutToken,
            redirectUrl: checkout.redirectUrl,
        }
    }
}
