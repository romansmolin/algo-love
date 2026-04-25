'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Lock, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'

type AILockedModalProps = {
    open: boolean
    onClose: () => void
}

export function AILockedModal({ open, onClose }: AILockedModalProps) {
    useEffect(() => {
        if (!open) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-locked-modal-title"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent-warm)] text-[var(--accent)]">
                        <Lock className="h-5 w-5" />
                    </div>
                    <div>
                        <h2
                            id="ai-locked-modal-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            AI features are locked
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Unlock all AI features (profile analyzer, photo spotlight, match
                            radar, bio rewrite) with a time-based pass.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button asChild onClick={onClose}>
                        <Link href="/ai-unlock">View Plans</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
