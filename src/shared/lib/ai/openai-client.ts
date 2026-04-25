import 'server-only'

import { AppError } from '@/shared/errors/app-error'

export type OpenAIMessage =
    | { role: 'system' | 'user' | 'assistant'; content: string }

export type OpenAIRequest = {
    messages: OpenAIMessage[]
    jsonSchema: {
        name: string
        schema: Record<string, unknown>
    }
    model?: string
    temperature?: number
}

export type OpenAIUsage = {
    promptTokens: number
    completionTokens: number
}

export type OpenAIResponse = {
    raw: string
    usage: OpenAIUsage
}

const DEFAULT_MODEL = 'gpt-4o-mini'

export const callOpenAI = async (request: OpenAIRequest): Promise<OpenAIResponse> => {
    const apiKey = process.env.OPENAI_API_KEY?.trim()
    if (!apiKey) {
        throw AppError.internalError('OPENAI_API_KEY is not configured')
    }

    const model = request.model ?? process.env.OPENAI_MODEL?.trim() ?? DEFAULT_MODEL

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: request.messages,
            temperature: request.temperature ?? 0.4,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: request.jsonSchema.name,
                    strict: true,
                    schema: request.jsonSchema.schema,
                },
            },
        }),
    })

    if (!response.ok) {
        const text = await response.text().catch(() => '')
        console.error('[openai] non-ok response', { status: response.status, text })
        throw AppError.internalError(`AI provider returned ${response.status}`)
    }

    const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>
        usage?: { prompt_tokens?: number; completion_tokens?: number }
    }

    const raw = payload.choices?.[0]?.message?.content
    if (!raw) {
        throw AppError.internalError('AI provider returned empty content')
    }

    return {
        raw,
        usage: {
            promptTokens: payload.usage?.prompt_tokens ?? 0,
            completionTokens: payload.usage?.completion_tokens ?? 0,
        },
    }
}
