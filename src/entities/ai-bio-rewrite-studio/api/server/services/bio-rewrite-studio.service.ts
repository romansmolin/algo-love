import 'server-only'

import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { AIGate } from '@/shared/lib/ai/ai-gate'
import { callOpenAI } from '@/shared/lib/ai/openai-client'

export const BIO_REWRITE_TONES = [
    'witty',
    'warm',
    'confident',
    'playful',
    'sincere',
    'mysterious',
] as const
export type BioRewriteTone = (typeof BIO_REWRITE_TONES)[number]

const outputSchema = z.object({
    rewrite: z.string(),
    alternative: z.string().optional(),
    notes: z.array(z.string()),
})

export type BioRewriteStudioOutput = z.infer<typeof outputSchema>

const jsonSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['rewrite', 'notes'],
    properties: {
        rewrite: { type: 'string' },
        alternative: { type: 'string' },
        notes: { type: 'array', items: { type: 'string' } },
    },
} as const

@injectable()
export class BioRewriteStudioService {
    constructor(@inject(AIGate) private gate: AIGate) {}

    async run(input: { userId: string; userDatingId: number; bio: string; tone: BioRewriteTone }) {
        const cleanBio = input.bio.trim()
        if (!cleanBio) {
            throw AppError.validationError('Bio is empty', [
                { field: 'bio', message: 'bio must contain text to rewrite' },
            ])
        }

        return this.gate.run<BioRewriteStudioOutput>({
            userId: input.userId,
            feature: 'bio_rewrite_studio',
            subjectKey: String(input.userDatingId),
            cacheInput: { bio: cleanBio, tone: input.tone },
            execute: async () => {
                const response = await callOpenAI({
                    jsonSchema: { name: 'bio_rewrite_studio', schema: jsonSchema },
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are a dating-bio editor. Rewrite the user bio in the requested tone, preserve concrete details, drop clichés, keep it under 700 characters. Provide a short alternative variant and 2–4 brief notes on what you changed and why.',
                        },
                        {
                            role: 'user',
                            content: `Tone: ${input.tone}\nBio:\n${cleanBio}`,
                        },
                    ],
                    temperature: 0.7,
                })

                const parsed = outputSchema.safeParse(JSON.parse(response.raw))
                if (!parsed.success) {
                    console.error('[bio-rewrite-studio] schema validation failed', {
                        issues: parsed.error.issues,
                    })
                    throw AppError.internalError('AI returned malformed output')
                }

                return { output: parsed.data, usage: response.usage }
            },
        })
    }
}
