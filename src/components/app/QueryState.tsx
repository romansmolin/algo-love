import type { ReactNode } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { getErrorMessage } from './error-utils'

type QueryStateProps = {
    isLoading?: boolean
    isError?: boolean
    error?: unknown
    isEmpty?: boolean
    emptyMessage?: string
    loadingMessage?: string
    children: ReactNode
}

export function QueryState({
    isLoading,
    isError,
    error,
    isEmpty,
    emptyMessage = 'No data found.',
    loadingMessage = 'Loading...',
    children,
}: QueryStateProps) {
    if (isLoading) {
        return (
            <div className="flex min-h-24 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingMessage}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex min-h-24 items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{getErrorMessage(error, 'Failed to load data.')}</span>
            </div>
        )
    }

    if (isEmpty) {
        return (
            <div className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {emptyMessage}
            </div>
        )
    }

    return <>{children}</>
}
