export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
    if (error && typeof error === 'object') {
        const payload = error as {
            data?: {
                message?: string
                error?: { message?: string }
            }
            error?: string
            message?: string
        }

        const message = payload.data?.message || payload.data?.error?.message || payload.error || payload.message
        if (typeof message === 'string' && message.trim()) {
            return message
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message
    }

    return fallback
}
