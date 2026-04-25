import 'server-only'

import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { AppError } from '@/shared/errors/app-error'
import { AIGate } from '@/shared/lib/ai/ai-gate'
import { callOpenAI } from '@/shared/lib/ai/openai-client'
import type { UserProfile } from '@/entities/user/model/types'

const outputSchema = z.object({
    compatibility: z.enum(['low', 'medium', 'high']),
    score: z.number().int().min(0).max(100),
    signals: z.array(z.string()).min(1),
    risks: z.array(z.string()),
    opener: z.string(),
})

export type MatchRadarOutput = z.infer<typeof outputSchema>

const jsonSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['compatibility', 'score', 'signals', 'risks', 'opener'],
    properties: {
        compatibility: { type: 'string', enum: ['low', 'medium', 'high'] },
        score: { type: 'integer', minimum: 0, maximum: 100 },
        signals: { type: 'array', items: { type: 'string' } },
        risks: { type: 'array', items: { type: 'string' } },
        opener: { type: 'string' },
    },
} as const

const slim = (profile: UserProfile) => ({
    id: profile.id,
    username: profile.username,
    age: profile.age ?? null,
    gender: profile.gender ?? null,
    location: profile.location ?? null,
    description: profile.description ?? '',
    education: profile.education ?? null,
    profession: profile.profession ?? null,
    children: profile.children ?? null,
})

@injectable()
export class MatchRadarService {
    constructor(@inject(AIGate) private gate: AIGate) {}

    async run(input: { userId: string; me: UserProfile; candidate: UserProfile }) {
        if (input.me.id === input.candidate.id) {
            throw AppError.validationError('Cannot analyze compatibility with yourself')
        }

        const cacheInput = { me: slim(input.me), candidate: slim(input.candidate) }

        return this.gate.run<MatchRadarOutput>({
            userId: input.userId,
            feature: 'match_radar',
            subjectKey: String(input.candidate.id),
            cacheInput,
            execute: async () => {
                const response = await callOpenAI({
                    jsonSchema: { name: 'match_radar', schema: jsonSchema },
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You assess dating-profile compatibility. Be specific, mention concrete alignment points, list possible risks, and propose one personalized opener line that references their bio.',
                        },
                        {
                            role: 'user',
                            content: `Compare these two profiles and return compatibility analysis. Profiles JSON:\n${JSON.stringify(cacheInput)}`,
                        },
                    ],
                })

                const parsed = outputSchema.safeParse(JSON.parse(response.raw))
                if (!parsed.success) {
                    console.error('[match-radar] schema validation failed', {
                        issues: parsed.error.issues,
                    })
                    throw AppError.internalError('AI returned malformed output')
                }

                return { output: parsed.data, usage: response.usage }
            },
        })
    }
}
