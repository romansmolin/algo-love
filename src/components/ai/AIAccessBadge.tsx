'use client'

import { Lock, Sparkles } from 'lucide-react'
import { useAIUnlock } from './useAIUnlock'
import { cn } from '@/shared/lib/css/utils'

const formatRemaining = (expiresAt: string): string => {
    const ms = new Date(expiresAt).getTime() - Date.now()
    if (!Number.isFinite(ms) || ms <= 0) return 'expiring'

    const minutes = Math.floor(ms / 60_000)
    if (minutes < 60) return `${Math.max(minutes, 1)} min left`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h left`

    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} left`
}

export function AIAccessBadge() {
    const { isActive, expiresAt, isLoading } = useAIUnlock()

    if (isLoading) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-300" />
                AI status…
            </span>
        )
    }

    if (!isActive) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <Lock className="h-3 w-3" />
                AI locked
            </span>
        )
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800',
            )}
        >
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Sparkles className="h-3 w-3" />
            AI active · {expiresAt ? formatRemaining(expiresAt) : 'on'}
        </span>
    )
}
