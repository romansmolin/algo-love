import 'server-only'

const readRequired = (name: string): string => {
    const value = process.env[name]
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required env var: ${name}`)
    }
    return value
}

const formatPublicKey = (raw: string): string => {
    const normalized = raw
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\r?\n/g, '')
        .replace(/\\n/g, '')
        .trim()

    const wrapped = normalized.match(/.{1,64}/g)?.join('\n') ?? normalized
    return `-----BEGIN PUBLIC KEY-----\n${wrapped}\n-----END PUBLIC KEY-----`
}

const resolveBackendUrl = (): string => {
    const raw = readRequired('BACKEND_URL').replace(/\/$/, '')
    if (process.env.NODE_ENV === 'production' && raw.startsWith('http://')) {
        throw new Error('BACKEND_URL must use HTTPS in production for payment callbacks')
    }
    return raw
}

const resolveFrontendUrl = (): string => {
    const raw = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || '')
        .split(',')[0]
        ?.trim()
    if (!raw) {
        throw new Error('Missing required env var: FRONTEND_URL (or NEXT_PUBLIC_APP_URL)')
    }
    return raw.replace(/\/$/, '')
}

const shopId = readRequired('SECURE_PROCESSOR_SHOP_ID')
const secretKey = readRequired('SECURE_PROCESSOR_SECRET_KEY')
const publicKey = formatPublicKey(readRequired('SECURE_PROCESSOR_PUBLIC_KEY'))
const apiBaseUrl = readRequired('SECURE_PROCESSOR_API_BASE_URL').replace(/\/$/, '')
const checkoutTokenPath = readRequired('SECURE_PROCESSOR_CHECKOUT_TOKEN_PATH')
const backendBaseUrl = resolveBackendUrl()
const frontendBaseUrl = resolveFrontendUrl()

const authHeader = `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`

const isTestMode = process.env.SECURE_PROCESSOR_TEST_MODE === 'true'

export const secureProcessorConfig = {
    shopId,
    secretKey,
    publicKey,
    apiBaseUrl,
    checkoutTokenPath,
    backendBaseUrl,
    frontendBaseUrl,
    authHeader,
    isTestMode,
} as const
