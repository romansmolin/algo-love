import 'server-only'

import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { AIGate } from '@/shared/lib/ai/ai-gate'
import { callOpenAI } from '@/shared/lib/ai/openai-client'
import type { UserProfile } from '@/entities/user/model/types'

const outputSchema = z.object({
    overallScore: z.number().int().min(0).max(100),
    summary: z.string(),
    items: z
        .array(
            z.object({
                category: z.string(),
                severity: z.enum(['low', 'medium', 'high']),
                message: z.string(),
                suggestion: z.string(),
            }),
        )
        .min(1),
})

export type ProfileAnalyzerOutput = z.infer<typeof outputSchema>

const jsonSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['overallScore', 'summary', 'items'],
    properties: {
        overallScore: { type: 'integer', minimum: 0, maximum: 100 },
        summary: { type: 'string' },
        items: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['category', 'severity', 'message', 'suggestion'],
                properties: {
                    category: { type: 'string' },
                    severity: { type: 'string', enum: ['low', 'medium', 'high'] },
                    message: { type: 'string' },
                    suggestion: { type: 'string' },
                },
            },
        },
    },
} as const

const buildCacheInput = (profile: UserProfile) => ({
    description: profile.description ?? '',
    fullName: profile.fullName ?? '',
    age: profile.age ?? null,
    gender: profile.gender ?? null,
    location: profile.location ?? null,
    photoCount: profile.photoCount ?? 0,
    fields: {
        height: profile.height ?? null,
        weight: profile.weight ?? null,
        education: profile.education ?? null,
        profession: profile.profession ?? null,
    },
})

@injectable()
export class ProfileAnalyzerService {
    constructor(@inject(AIGate) private gate: AIGate) {}

    async run(input: { userId: string; profile: UserProfile }) {
        const { userId, profile } = input

        return this.gate.run<ProfileAnalyzerOutput>({
            userId,
            feature: 'profile_analyzer',
            subjectKey: String(profile.id),
            cacheInput: buildCacheInput(profile),
            execute: async () => {
                const response = await callOpenAI({
                    jsonSchema: { name: 'profile_analyzer', schema: jsonSchema },
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are a dating-profile coach. Analyze the user profile and produce concrete, kind, actionable feedback. Avoid generic advice.',
                        },
                        {
                            role: 'user',
                            content: `Analyze this dating profile and produce a checklist of advice items. Profile JSON:\n${JSON.stringify(buildCacheInput(profile))}`,
                        },
                    ],
                })

                const parsed = outputSchema.safeParse(JSON.parse(response.raw))
                if (!parsed.success) {
                    console.error('[profile-analyzer] schema validation failed', {
                        issues: parsed.error.issues,
                    })
                    throw AppError.internalError('AI returned malformed output')
                }

                return { output: parsed.data, usage: response.usage }
            },
        })
    }
}
