import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'

type SendPaymentSuccessEmailInput = {
    email: string
    credits: number
}

type SendWelcomeEmailInput = {
    email: string
    username: string
}

type SmtpConfig = {
    host: string
    port: number
    secure: boolean
    from: string
    user?: string
    pass?: string
}

let missingConfigLogged = false
let transporterPromise: Promise<Transporter> | null = null

const parseBoolean = (value?: string): boolean => {
    if (!value) return false
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

const escapeHtml = (value: string): string => {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

const getSmtpConfig = (): SmtpConfig | null => {
    const host = process.env.SMTP_HOST?.trim()
    const portRaw = process.env.SMTP_PORT?.trim()
    const from = process.env.SMTP_FROM?.trim()
    const user = process.env.SMTP_USER?.trim()
    const pass = process.env.SMTP_PASS?.trim()
    const secure = parseBoolean(process.env.SMTP_SECURE)

    if (!host || !portRaw || !from) {
        if (!missingConfigLogged) {
            missingConfigLogged = true
            console.warn('[Mailer] SMTP is not configured. Emails are skipped.')
        }
        return null
    }

    const port = Number(portRaw)
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error('[Mailer] SMTP_PORT must be a positive integer')
    }

    return { host, port, secure, from, user, pass }
}

const getTransporter = async (config: SmtpConfig): Promise<Transporter> => {
    if (!transporterPromise) {
        transporterPromise = Promise.resolve(
            nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth:
                    config.user && config.pass
                        ? {
                              user: config.user,
                              pass: config.pass,
                          }
                        : undefined,
            }),
        )
    }

    return transporterPromise
}

const sendEmail = async (args: {
    to: string
    subject: string
    text: string
    html: string
}): Promise<void> => {
    const config = getSmtpConfig()
    if (!config) return

    const transporter = await getTransporter(config)
    const info = await transporter.sendMail({
        from: config.from,
        to: args.to,
        subject: args.subject,
        text: args.text,
        html: args.html,
    })

    console.info('[Mailer] Email sent', { to: args.to, messageId: info.messageId })
}

export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<void> {
    const safeName = input.username.trim() || 'there'
    const safeNameHtml = escapeHtml(safeName)

    await sendEmail({
        to: input.email,
        subject: 'Welcome to AlgoLove',
        text: `Hi ${safeName}, welcome to AlgoLove! Your account is ready. Sign in and start finding compatibility-first matches.`,
        html: `<p>Hi ${safeNameHtml},</p><p>Welcome to <strong>AlgoLove</strong>! Your account is ready.</p><p>Sign in and start finding compatibility-first matches.</p>`,
    })
}

export async function sendPaymentSuccessEmail(
    input: SendPaymentSuccessEmailInput,
): Promise<void> {
    await sendEmail({
        to: input.email,
        subject: 'Your AlgoLove credits were added',
        text: `Your purchase is complete. ${input.credits} credits were added to your wallet.`,
        html: `<p>Your purchase is complete.</p><p><strong>${input.credits} credits</strong> were added to your wallet.</p>`,
    })
}
