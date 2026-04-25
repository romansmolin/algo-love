'use client'

import { useState } from 'react'
import { MessageSquare, Wand2 } from 'lucide-react'
import {
    BIO_REWRITE_TONES,
    type AIGateResult,
    type BioRewriteStudioResult,
    type BioRewriteTone,
    useRunBioRewriteStudioMutation,
} from '@/entities/ai-features'
import { useAIUnlockGate } from './AIUnlockGateProvider'
import { getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'

type BioRewritePanelProps = {
    bio: string
    onApply: (rewrite: string) => void
}

export function BioRewritePanel({ bio, onApply }: BioRewritePanelProps) {
    const { runIfUnlocked } = useAIUnlockGate()
    const [rewrite, { isLoading }] = useRunBioRewriteStudioMutation()
    const [tone, setTone] = useState<BioRewriteTone>('warm')
    const [result, setResult] = useState<AIGateResult<BioRewriteStudioResult> | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handle = async () => {
        setError(null)

        if (!bio.trim()) {
            setError('Write a bio first — there is nothing to rewrite yet.')
            return
        }

        await runIfUnlocked(async () => {
            const response = await rewrite({ bio, tone })
            if ('error' in response) {
                setError(getErrorMessage(response.error, 'Bio rewrite failed.'))
                return
            }
            setResult(response.data)
        })
    }

    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                    <Wand2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                    AI Bio Rewrite
                </span>
                <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value as BioRewriteTone)}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900"
                >
                    {BIO_REWRITE_TONES.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <Button type="button" size="sm" disabled={isLoading} onClick={handle}>
                    <MessageSquare className="h-4 w-4" />
                    {isLoading ? 'Rewriting…' : `Rewrite (${tone})`}
                </Button>
            </div>

            {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

            {result ? (
                <div className="mt-3 space-y-2 text-sm">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Rewrite</p>
                        <p className="mt-1 whitespace-pre-line text-slate-900">
                            {result.output.rewrite}
                        </p>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => onApply(result.output.rewrite)}
                        >
                            Apply to description
                        </Button>
                    </div>
                    {result.output.alternative ? (
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Alternative</p>
                            <p className="mt-1 whitespace-pre-line text-slate-900">
                                {result.output.alternative}
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="mt-1"
                                onClick={() => onApply(result.output.alternative ?? '')}
                            >
                                Apply alternative
                            </Button>
                        </div>
                    ) : null}
                    {result.output.notes.length > 0 ? (
                        <ul className="list-inside list-disc text-xs text-slate-600">
                            {result.output.notes.map((note, index) => (
                                <li key={index}>{note}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
