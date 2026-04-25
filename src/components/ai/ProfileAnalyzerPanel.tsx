'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
    type AIGateResult,
    type ProfileAnalyzerResult,
    useRunProfileAnalyzerMutation,
} from '@/entities/ai-features'
import { useAIUnlockGate } from './AIUnlockGateProvider'
import { AppSectionCard, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'

const severityTone: Record<'low' | 'medium' | 'high', string> = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-rose-100 text-rose-800',
}

export function ProfileAnalyzerPanel() {
    const { runIfUnlocked } = useAIUnlockGate()
    const [analyze, { isLoading }] = useRunProfileAnalyzerMutation()
    const [result, setResult] = useState<AIGateResult<ProfileAnalyzerResult> | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handle = async () => {
        setError(null)
        await runIfUnlocked(async () => {
            const response = await analyze()
            if ('error' in response) {
                setError(getErrorMessage(response.error, 'Profile analyzer failed.'))
                return
            }
            setResult(response.data)
        })
    }

    return (
        <AppSectionCard
            title="AI Profile Analyzer"
            description="Get a coaching checklist for your own profile."
        >
            <Button type="button" disabled={isLoading} onClick={handle}>
                <Sparkles className="h-4 w-4" />
                {isLoading ? 'Analyzing…' : 'Analyze my profile'}
            </Button>

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            {result ? (
                <div className="mt-4 space-y-3 text-sm">
                    <p className="text-slate-700">
                        <span className="font-semibold">Score: {result.output.overallScore}/100</span>
                        {result.cached ? (
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                cached
                            </span>
                        ) : null}
                    </p>
                    <p className="text-slate-700">{result.output.summary}</p>
                    <ul className="space-y-2">
                        {result.output.items.map((item, index) => (
                            <li
                                key={`${item.category}-${index}`}
                                className="rounded-xl border border-slate-200 p-3"
                            >
                                <p className="flex items-center gap-2 text-xs">
                                    <span className="uppercase tracking-wide text-slate-500">
                                        {item.category}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 ${severityTone[item.severity]}`}
                                    >
                                        {item.severity}
                                    </span>
                                </p>
                                <p className="mt-1 text-sm text-slate-900">{item.message}</p>
                                <p className="mt-1 text-sm text-slate-600">{item.suggestion}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </AppSectionCard>
    )
}
