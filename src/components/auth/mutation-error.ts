import { normalizeError } from '@/shared/api/client/error-normalizer'

type FieldIssue = {
    field: string
    message: string
}

export type ParsedMutationError = {
    message: string
    fields?: FieldIssue[]
}

export function parseMutationError(error: unknown, fallback: string): ParsedMutationError {
    if (error && typeof error === 'object') {
        const payload = error as {
            data?: {
                message?: string
                fields?: FieldIssue[]
                error?: {
                    message?: string
                    fields?: FieldIssue[]
                }
            }
            error?: string
        }

        const errorMessage = payload.data?.message || payload.data?.error?.message || payload.error
        const fields = payload.data?.fields || payload.data?.error?.fields

        if (typeof errorMessage === 'string' && errorMessage.trim()) {
            return {
                message: errorMessage,
                fields,
            }
        }
    }

    const normalized = normalizeError(error)
    return {
        message: normalized.message || fallback,
        fields: normalized.fields,
    }
}
