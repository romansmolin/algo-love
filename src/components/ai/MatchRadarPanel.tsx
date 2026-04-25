'use client'

import { useState } from 'react'
import { Radar } from 'lucide-react'
import {
    type AIGateResult,
    type MatchRadarResult,
    useRunMatchRadarMutation,
} from '@/entities/ai-features'
import { useAIUnlockGate } from './AIUnlockGateProvider'
import { AppSectionCard, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'

const compatibilityTone: Record<'low' | 'medium' | 'high', string> = {
    low: 'bg-rose-100 text-rose-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-emerald-100 text-emerald-800',
}

type MatchRadarPanelProps = {
    candidateDatingId: number
}

export function MatchRadarPanel({ candidateDatingId }: MatchRadarPanelProps) {
    const { runIfUnlocked } = useAIUnlockGate()
    const [radar, { isLoading }] = useRunMatchRadarMutation()
    const [result, setResult] = useState<AIGateResult<MatchRadarResult> | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handle = async () => {
        setError(null)
        await runIfUnlocked(async () => {
            const response = await radar({ candidateDatingId })
            if ('error' in response) {
                setError(getErrorMessage(response.error, 'Match radar failed.'))
                return
            }
            setResult(response.data)
        })
    }

    return (
        <AppSectionCard
            title="AI Match Radar"
            description="Compatibility analysis and a personalized opener."
        >
            <Button type="button" disabled={isLoading} onClick={handle}>
                <Radar className="h-4 w-4" />
                {isLoading ? 'Scanning…' : 'Run match radar'}
            </Button>

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            {result ? (
                <div className="mt-4 space-y-3 text-sm">
                    <p className="flex flex-wrap items-center gap-2 text-slate-700">
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${compatibilityTone[result.output.compatibility]}`}
                        >
                            {result.output.compatibility}
                        </span>
                        <span>Score: {result.output.score}/100</span>
                        {result.cached ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                cached
                            </span>
                        ) : null}
                    </p>

                    {result.output.signals.length > 0 ? (
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Signals</p>
                            <ul className="mt-1 list-inside list-disc text-slate-700">
                                {result.output.signals.map((signal, index) => (
                                    <li key={index}>{signal}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {result.output.risks.length > 0 ? (
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Risks</p>
                            <ul className="mt-1 list-inside list-disc text-slate-700">
                                {result.output.risks.map((risk, index) => (
                                    <li key={index}>{risk}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Suggested opener
                        </p>
                        <p className="mt-1 italic text-slate-900">“{result.output.opener}”</p>
                    </div>
                </div>
            ) : null}
        </AppSectionCard>
    )
}
