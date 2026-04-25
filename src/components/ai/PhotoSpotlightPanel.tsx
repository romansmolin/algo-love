'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import {
    type AIGateResult,
    type PhotoSpotlightResult,
    useRunPhotoSpotlightMutation,
} from '@/entities/ai-features'
import { useAIUnlockGate } from './AIUnlockGateProvider'
import { AppSectionCard, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'

export function PhotoSpotlightPanel() {
    const { runIfUnlocked } = useAIUnlockGate()
    const [spotlight, { isLoading }] = useRunPhotoSpotlightMutation()
    const [result, setResult] = useState<AIGateResult<PhotoSpotlightResult> | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handle = async () => {
        setError(null)
        await runIfUnlocked(async () => {
            const response = await spotlight()
            if ('error' in response) {
                setError(getErrorMessage(response.error, 'Photo spotlight failed.'))
                return
            }
            setResult(response.data)
        })
    }

    return (
        <AppSectionCard
            title="AI Photo Spotlight"
            description="Recommend a primary photo and a re-ordered sequence."
        >
            <Button type="button" disabled={isLoading} onClick={handle}>
                <Camera className="h-4 w-4" />
                {isLoading ? 'Scoring…' : 'Score my photos'}
            </Button>

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            {result ? (
                <div className="mt-4 space-y-3 text-sm">
                    <p className="text-slate-700">
                        Primary: photo #{result.output.recommendedPrimaryIndex + 1}
                        {result.cached ? (
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                cached
                            </span>
                        ) : null}
                    </p>
                    <p className="text-slate-700">
                        Recommended order:{' '}
                        {result.output.ordering.map((i) => `#${i + 1}`).join(' → ')}
                    </p>
                    <ul className="space-y-2">
                        {result.output.notes.map((note) => (
                            <li
                                key={note.index}
                                className="rounded-xl border border-slate-200 p-3"
                            >
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Photo #{note.index + 1} · {note.score}/100
                                </p>
                                {note.strengths.length > 0 ? (
                                    <p className="mt-1 text-sm text-emerald-700">
                                        + {note.strengths.join('; ')}
                                    </p>
                                ) : null}
                                {note.improvements.length > 0 ? (
                                    <p className="text-sm text-amber-700">
                                        Δ {note.improvements.join('; ')}
                                    </p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </AppSectionCard>
    )
}
