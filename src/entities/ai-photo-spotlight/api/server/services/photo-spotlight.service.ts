import 'server-only'

import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { createHash } from 'node:crypto'
import { AppError } from '@/shared/errors/app-error'
import { AIGate } from '@/shared/lib/ai/ai-gate'
import { callOpenAI } from '@/shared/lib/ai/openai-client'

const outputSchema = z.object({
    recommendedPrimaryIndex: z.number().int().min(0),
    ordering: z.array(z.number().int().min(0)).min(1),
    notes: z
        .array(
            z.object({
                index: z.number().int().min(0),
                strengths: z.array(z.string()),
                improvements: z.array(z.string()),
                score: z.number().int().min(0).max(100),
            }),
        )
        .min(1),
})

export type PhotoSpotlightOutput = z.infer<typeof outputSchema>

const jsonSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['recommendedPrimaryIndex', 'ordering', 'notes'],
    properties: {
        recommendedPrimaryIndex: { type: 'integer', minimum: 0 },
        ordering: { type: 'array', items: { type: 'integer', minimum: 0 } },
        notes: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['index', 'strengths', 'improvements', 'score'],
                properties: {
                    index: { type: 'integer', minimum: 0 },
                    strengths: { type: 'array', items: { type: 'string' } },
                    improvements: { type: 'array', items: { type: 'string' } },
                    score: { type: 'integer', minimum: 0, maximum: 100 },
                },
            },
        },
    },
} as const

const subjectKeyForPhotos = (urls: string[]): string => {
    const joined = urls.slice().sort().join('|')
    return createHash('sha256').update(joined, 'utf8').digest('hex').slice(0, 24)
}

@injectable()
export class PhotoSpotlightService {
    constructor(@inject(AIGate) private gate: AIGate) {}

    async run(input: { userId: string; photoUrls: string[] }) {
        if (input.photoUrls.length === 0) {
            throw AppError.validationError('No photos to analyze', [
                { field: 'photoUrls', message: 'photoUrls must contain at least one URL' },
            ])
        }

        const subjectKey = subjectKeyForPhotos(input.photoUrls)

        return this.gate.run<PhotoSpotlightOutput>({
            userId: input.userId,
            feature: 'photo_spotlight',
            subjectKey,
            cacheInput: { photoUrls: input.photoUrls },
            execute: async () => {
                const response = await callOpenAI({
                    jsonSchema: { name: 'photo_spotlight', schema: jsonSchema },
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are a dating-photo coach. Without seeing the actual photos, infer likely strengths and weaknesses purely from the URL count and ordering metadata, and propose a recommended primary photo and a re-ordered sequence. Be honest, specific, and actionable.',
                        },
                        {
                            role: 'user',
                            content: `The user has ${input.photoUrls.length} photos in this order: ${JSON.stringify(input.photoUrls)}. Recommend a primary spotlight (by index) and a re-ordered sequence by index, with notes per photo.`,
                        },
                    ],
                })

                const parsed = outputSchema.safeParse(JSON.parse(response.raw))
                if (!parsed.success) {
                    console.error('[photo-spotlight] schema validation failed', {
                        issues: parsed.error.issues,
                    })
                    throw AppError.internalError('AI returned malformed output')
                }

                return { output: parsed.data, usage: response.usage }
            },
        })
    }
}
