import 'server-only'
import type { PaymentTokenStatus } from '../../../model/types'

export const normalizeGatewayStatus = (status?: string | null): PaymentTokenStatus => {
    if (!status) return 'PENDING'

    const normalized = status.toLowerCase()

    if (['success', 'successful', 'paid', 'approved'].includes(normalized)) return 'SUCCESSFUL'
    if (['pending', 'processing', 'incomplete', 'awaiting'].includes(normalized)) return 'PENDING'
    if (['declined', 'canceled', 'cancelled'].includes(normalized)) return 'DECLINED'
    if (['failed', 'error'].includes(normalized)) return 'FAILED'
    if (normalized === 'expired') return 'EXPIRED'

    return 'PENDING'
}

export type CheckoutDetails = {
    gatewayToken: string | null
    trackingId: string | null
    status: string | null
    uid: string | null
    amountCents: number | null
    currency: string | null
    testMode: boolean | null
    rawPayload: unknown
}

type PayloadObject = Record<string, unknown>

const asObject = (value: unknown): PayloadObject => {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as PayloadObject : {}
}

const asString = (value: unknown): string | null => {
    return typeof value === 'string' ? value : null
}

const asNumber = (value: unknown): number | null => {
    return typeof value === 'number' ? value : null
}

export const extractCheckoutDetails = (payload: unknown): CheckoutDetails => {
    const payloadObject = asObject(payload)
    const checkout = asObject(payloadObject.checkout)
    const transaction = asObject(payloadObject.transaction)
    const root =
        Object.keys(checkout).length > 0
            ? checkout
            : Object.keys(transaction).length > 0
              ? transaction
              : payloadObject
    const order = asObject(root.order ?? payloadObject.order)
    const gatewayResponse = asObject(root.gateway_response ?? payloadObject.gateway_response)
    const payment = asObject(gatewayResponse.payment ?? root.payment ?? payloadObject.payment)
    const additionalData = asObject(root.additional_data ?? payloadObject.additional_data)
    const vendor = asObject(additionalData.vendor)

    const gatewayToken =
        asString(root.token) ?? asString(payment.token) ?? asString(payloadObject.token) ?? asString(vendor.token)
    const trackingId =
        asString(root.tracking_id) ??
        asString(order.tracking_id) ??
        asString(payment.tracking_id) ??
        asString(gatewayResponse.tracking_id) ??
        asString(payloadObject.tracking_id)
    const status =
        asString(payment.status) ??
        asString(root.status) ??
        asString(payloadObject.status) ??
        asString(gatewayResponse.status)
    const uid =
        asString(payment.uid) ??
        asString(root.uid) ??
        asString(gatewayResponse.uid) ??
        asString(payloadObject.uid)
    const amountCents =
        asNumber(order.amount) ?? asNumber(root.amount) ?? asNumber(payment.amount)
    const currency = asString(order.currency) ?? asString(root.currency) ?? asString(payment.currency)
    const testMode = Boolean(
        root.test ?? gatewayResponse.test ?? payment.test ?? asObject(checkout.settings).test ?? null,
    )

    return {
        gatewayToken,
        trackingId,
        status,
        uid,
        amountCents,
        currency,
        testMode,
        rawPayload: payload,
    }
}
