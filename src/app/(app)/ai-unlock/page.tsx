'use client'

import { useState } from 'react'
import { CheckCircle2, Coins, Sparkles } from 'lucide-react'
import {
    useGetAIUnlockProductsQuery,
    usePurchaseAIUnlockMutation,
} from '@/entities/ai-unlock'
import type {
    AIUnlockProduct,
    AIUnlockPurchaseRequest,
} from '@/entities/ai-unlock'
import { useAIUnlock } from '@/components/ai'
import { AppPageShell, AppSectionCard, QueryState, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/css/utils'

const formatExpiry = (iso: string): string => {
    try {
        return new Date(iso).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return iso
    }
}

export default function AIUnlockPage() {
    const productsQuery = useGetAIUnlockProductsQuery()
    const { isActive, expiresAt, durationDays } = useAIUnlock()
    const [purchase, { isLoading: isPurchasing }] = usePurchaseAIUnlockMutation()
    const [pendingId, setPendingId] = useState<AIUnlockProduct['id'] | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handlePurchase = async (productId: AIUnlockProduct['id']) => {
        setStatusMessage(null)
        setErrorMessage(null)
        setPendingId(productId)

        const payload: AIUnlockPurchaseRequest = { productId }
        const result = await purchase(payload)

        setPendingId(null)

        if ('error' in result) {
            setErrorMessage(getErrorMessage(result.error, 'Purchase failed.'))
            return
        }

        setStatusMessage(
            `Pass active until ${formatExpiry(result.data.expiresAt)} (${result.data.durationDays} day${result.data.durationDays === 1 ? '' : 's'}).`,
        )
    }

    const products = productsQuery.data?.products ?? []

    return (
        <AppPageShell
            title="AI Unlock"
            description="Get full access to every AI feature with a time-based pass paid in Glow Coins."
        >
            <AppSectionCard title="Current status" description="Your current AI access.">
                {isActive ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                        <CheckCircle2 className="mt-0.5 h-5 w-5" />
                        <div>
                            <p className="font-medium">AI is active.</p>
                            {expiresAt ? (
                                <p className="mt-1">
                                    Pass expires {formatExpiry(expiresAt)}
                                    {durationDays
                                        ? ` (${durationDays} day${durationDays === 1 ? '' : 's'})`
                                        : ''}
                                    . Buying another pass extends from this expiry.
                                </p>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-medium">AI is locked.</p>
                        <p className="mt-1">Pick a pass below to enable every AI feature.</p>
                    </div>
                )}
            </AppSectionCard>

            <AppSectionCard title="Plans" description="Pay with Glow Coins from your wallet.">
                <QueryState
                    isLoading={productsQuery.isLoading}
                    isError={productsQuery.isError}
                    error={productsQuery.error}
                    isEmpty={
                        !productsQuery.isLoading && !productsQuery.isError && products.length === 0
                    }
                    emptyMessage="No plans available."
                    loadingMessage="Loading plans…"
                >
                    <div className="grid gap-3 sm:grid-cols-3">
                        {products.map((product) => {
                            const isPending = pendingId === product.id && isPurchasing
                            return (
                                <article
                                    key={product.id}
                                    className={cn(
                                        'flex flex-col rounded-2xl border border-slate-200 bg-white p-4',
                                        product.id === 'ai_unlock_7d' && 'ring-2 ring-[var(--accent)]',
                                    )}
                                >
                                    <header className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                                            <p className="text-sm font-semibold text-slate-900">
                                                {product.title}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[var(--accent-warm)] px-2 py-0.5 text-xs font-medium text-slate-700">
                                            {product.durationDays}d
                                        </span>
                                    </header>
                                    <p className="mt-2 text-sm text-slate-600">{product.description}</p>
                                    <p className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-slate-900">
                                        <Coins className="h-4 w-4 text-[var(--accent)]" />
                                        {product.priceCoins} Glow Coins
                                    </p>
                                    <Button
                                        type="button"
                                        className="mt-4"
                                        disabled={isPending}
                                        onClick={() => handlePurchase(product.id)}
                                    >
                                        {isPending ? 'Processing…' : 'Unlock'}
                                    </Button>
                                </article>
                            )
                        })}
                    </div>

                    {statusMessage ? (
                        <p className="mt-4 text-sm text-emerald-700">{statusMessage}</p>
                    ) : null}
                    {errorMessage ? (
                        <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
                    ) : null}
                </QueryState>
            </AppSectionCard>
        </AppPageShell>
    )
}
