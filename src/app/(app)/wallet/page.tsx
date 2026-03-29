'use client'

import { useMemo, useState } from 'react'
import { WalletCards } from 'lucide-react'
import { useGetWalletQuery, usePurchaseCreditsMutation, type CreditTransaction } from '@/entities/credit'
import { AppPageShell, AppSectionCard, QueryState, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'

const PRESET_PACKS = [
    { eur: 1, label: 'Starter €1' },
    { eur: 5, label: 'Core €5' },
    { eur: 10, label: 'Pro €10' },
] as const

const formatDate = (value: Date | string): string => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

const amountLabel = (transaction: CreditTransaction): string => {
    const amount = Math.abs(transaction.amount)

    if (transaction.type === 'spend') {
        return `-${amount}`
    }

    return `+${amount}`
}

const statusBadgeClass = (status: CreditTransaction['status']): string => {
    if (status === 'SUCCESSFUL') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
}

export default function WalletPage() {
    const walletQuery = useGetWalletQuery()
    const [purchaseCredits, { isLoading: isPurchasing }] = usePurchaseCreditsMutation()

    const [consentAccepted, setConsentAccepted] = useState(false)
    const [purchaseError, setPurchaseError] = useState<string | null>(null)
    const [purchaseInfo, setPurchaseInfo] = useState<string | null>(null)

    const wallet = walletQuery.data?.wallet
    const transactions = walletQuery.data?.transactions ?? []

    const summaryCards = useMemo(
        () => [
            { label: 'Current balance', value: wallet ? `${wallet.balance} coins` : '—' },
            { label: 'Total purchased', value: wallet ? `${wallet.totalPurchased} coins` : '—' },
            { label: 'Total spent', value: wallet ? `${wallet.totalSpent} coins` : '—' },
            { label: 'Pending credits', value: wallet ? `${wallet.pendingCredits} coins` : '—' },
        ],
        [wallet],
    )

    const handlePurchase = async (amountEur: 1 | 5 | 10) => {
        if (!consentAccepted) {
            setPurchaseError('You must accept consent before purchasing credits.')
            return
        }

        setPurchaseError(null)
        setPurchaseInfo(null)

        const result = await purchaseCredits({
            amountEur,
            pricingMode: 'preset',
            presetKey: amountEur,
            consentAccepted: true,
        })

        if ('error' in result) {
            setPurchaseError(getErrorMessage(result.error, 'Failed to initiate purchase.'))
            return
        }

        const redirectUrl = result.data.redirectUrl
        if (redirectUrl) {
            window.location.assign(redirectUrl)
            return
        }

        setPurchaseInfo(`Checkout token created: ${result.data.checkoutToken}`)
    }

    return (
        <AppPageShell
            title="Wallet"
            description="Track your coin balance, review transactions, and purchase preset credit packs."
        >
            <AppSectionCard title="Balance Overview" description="Live wallet totals from your account.">
                <QueryState
                    isLoading={walletQuery.isLoading}
                    isError={walletQuery.isError}
                    error={walletQuery.error}
                    loadingMessage="Loading wallet summary..."
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {summaryCards.map((item) => (
                            <article key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">{item.label}</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                            </article>
                        ))}
                    </div>
                </QueryState>
            </AppSectionCard>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                <AppSectionCard title="Transaction History" description="Recent credit grants, spending, and adjustments.">
                    <QueryState
                        isLoading={walletQuery.isLoading}
                        isError={walletQuery.isError}
                        error={walletQuery.error}
                        isEmpty={!walletQuery.isLoading && !walletQuery.isError && transactions.length === 0}
                        emptyMessage="No transactions yet."
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                                        <th className="px-2 py-2">Type</th>
                                        <th className="px-2 py-2">Amount</th>
                                        <th className="px-2 py-2">Status</th>
                                        <th className="px-2 py-2">Reason</th>
                                        <th className="px-2 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-slate-100">
                                            <td className="px-2 py-3 font-medium capitalize text-slate-800">{transaction.type}</td>
                                            <td className="px-2 py-3 text-slate-700">{amountLabel(transaction)}</td>
                                            <td className="px-2 py-3">
                                                <span
                                                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(transaction.status)}`}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-slate-600">{transaction.reason || '—'}</td>
                                            <td className="px-2 py-3 text-slate-600">{formatDate(transaction.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </QueryState>
                </AppSectionCard>

                <AppSectionCard title="Purchase Credits" description="Preset packs currently supported by API.">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Currency</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{wallet?.currency || 'EUR'}</p>
                            <p className="mt-1 text-xs text-slate-500">Payments are processed via secure checkout.</p>
                        </div>

                        <div className="space-y-2">
                            {PRESET_PACKS.map((pack) => (
                                <Button
                                    key={pack.eur}
                                    type="button"
                                    className="w-full justify-between"
                                    disabled={isPurchasing}
                                    onClick={() => handlePurchase(pack.eur)}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <WalletCards className="h-4 w-4" />
                                        {pack.label}
                                    </span>
                                    <span>{pack.eur * 30}+ coins</span>
                                </Button>
                            ))}
                        </div>

                        <label className="inline-flex items-start gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={consentAccepted}
                                onChange={(event) => setConsentAccepted(event.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                            />
                            I confirm I want to purchase credits and agree to billing terms.
                        </label>

                        {purchaseError ? <p className="text-sm text-red-600">{purchaseError}</p> : null}
                        {purchaseInfo ? <p className="text-sm text-emerald-700">{purchaseInfo}</p> : null}

                        <p className="text-xs text-slate-500">
                            If checkout returns a redirect URL, you will be forwarded automatically.
                        </p>
                    </div>
                </AppSectionCard>
            </div>
        </AppPageShell>
    )
}
