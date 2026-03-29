'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Gift, Coins } from 'lucide-react'
import { useGetGiftCatalogQuery, useGetGiftInventoryQuery, useBuyGiftMutation } from '@/entities/gift/api/client/endpoints'
import { useGetWalletQuery } from '@/entities/credit/api/client/endpoints'
import { AppPageShell, AppSectionCard, QueryState, getErrorMessage } from '@/components/app'
import { Button } from '@/shared/ui/button'

type GiftTheme = {
    key: 'bomb' | 'coffee' | 'fire' | 'flower' | 'gift' | 'trophy'
    imagePath: string
    title: string
    subtitle: string
}

const GIFT_THEMES: GiftTheme[] = [
    { key: 'bomb', imagePath: '/gifts/bomb.png', title: 'Love Bomb', subtitle: 'Bold surprise gift' },
    { key: 'coffee', imagePath: '/gifts/coffee.png', title: 'Espresso Invite', subtitle: 'Warm coffee mood' },
    { key: 'fire', imagePath: '/gifts/fire.png', title: 'Spark Flame', subtitle: 'High-energy vibe' },
    { key: 'flower', imagePath: '/gifts/flower.png', title: 'Scarlet Bloom', subtitle: 'Romantic classic' },
    { key: 'gift', imagePath: '/gifts/gift.png', title: 'Secret Parcel', subtitle: 'Mystery wrapped gift' },
    { key: 'trophy', imagePath: '/gifts/trophy.png', title: 'Golden Trophy', subtitle: 'Winner energy' },
]

const resolveThemeFromText = (sourceText: string): GiftTheme | undefined => {
    const source = sourceText.toLowerCase()
    return GIFT_THEMES.find((theme) => source.includes(theme.key))
}

export default function GiftsPage() {
    const catalogQuery = useGetGiftCatalogQuery()
    const inventoryQuery = useGetGiftInventoryQuery()
    const walletQuery = useGetWalletQuery()

    const [buyGift, { isLoading: isBuying }] = useBuyGiftMutation()
    const [pendingGiftId, setPendingGiftId] = useState<string | null>(null)
    const [feedbackError, setFeedbackError] = useState<string | null>(null)
    const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null)

    const catalog = useMemo(() => catalogQuery.data?.items ?? [], [catalogQuery.data?.items])
    const inventory = useMemo(() => inventoryQuery.data?.items ?? [], [inventoryQuery.data?.items])

    const inventoryByGiftId = useMemo(() => {
        return new Map(inventory.map((item) => [item.giftId, item]))
    }, [inventory])

    const themeByGiftId = useMemo(() => {
        const assigned = new Map<string, GiftTheme>()
        const used = new Set<GiftTheme['key']>()

        for (let index = 0; index < catalog.length; index += 1) {
            const item = catalog[index]
            const hinted = resolveThemeFromText(`${item.slug} ${item.name}`)

            if (hinted && !used.has(hinted.key)) {
                assigned.set(item.id, hinted)
                used.add(hinted.key)
                continue
            }

            const nextUnused =
                GIFT_THEMES.find((theme) => !used.has(theme.key)) ??
                GIFT_THEMES[index % GIFT_THEMES.length]

            assigned.set(item.id, nextUnused)
            used.add(nextUnused.key)
        }

        return assigned
    }, [catalog])

    const balance = walletQuery.data?.wallet.balance ?? 0
    const displayPrice = catalog[0]?.priceCoins ?? 30

    const handleBuyGift = async (giftId: string) => {
        setFeedbackError(null)
        setFeedbackSuccess(null)
        setPendingGiftId(giftId)

        const result = await buyGift({ giftId })

        setPendingGiftId(null)

        if ('error' in result) {
            setFeedbackError(getErrorMessage(result.error, 'Failed to buy gift.'))
            return
        }

        setFeedbackSuccess(
            `Gift purchased. Remaining balance: ${result.data.remainingBalance} coins. Inventory: ${result.data.inventoryQuantity}.`,
        )
    }

    return (
        <AppPageShell
            title="Gifts"
            description="Spend your credits on gifts and keep them in your personal library for future sends."
        >
            <AppSectionCard title="Gift Wallet" description="All gifts use the same price in this release.">
                <QueryState
                    isLoading={walletQuery.isLoading}
                    isError={walletQuery.isError}
                    error={walletQuery.error}
                    loadingMessage="Loading wallet balance..."
                >
                    <div className="grid gap-3 sm:grid-cols-3">
                        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Current balance</p>
                            <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
                                <Coins className="h-5 w-5 text-[var(--accent)]" />
                                {balance}
                            </p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Price per gift</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{displayPrice} coins</p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Gift types available</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{catalog.length}</p>
                        </article>
                    </div>
                </QueryState>
            </AppSectionCard>

            <AppSectionCard title="Gift Catalog" description="Buy gifts using your credits.">
                <QueryState
                    isLoading={catalogQuery.isLoading}
                    isError={catalogQuery.isError}
                    error={catalogQuery.error}
                    isEmpty={!catalogQuery.isLoading && !catalogQuery.isError && catalog.length === 0}
                    emptyMessage="No gifts available right now."
                    loadingMessage="Loading gift catalog..."
                >
                    {feedbackError ? <p className="mb-3 text-sm text-red-600">{feedbackError}</p> : null}
                    {feedbackSuccess ? <p className="mb-3 text-sm text-emerald-700">{feedbackSuccess}</p> : null}

                    <div className="mb-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                        {GIFT_THEMES.map((theme) => (
                            <div key={theme.key} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                                <div className="relative mx-auto h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <Image src={theme.imagePath} alt={theme.title} fill sizes="40px" className="object-cover" />
                                </div>
                                <p className="mt-1 truncate text-center text-[11px] font-medium text-slate-700">
                                    {theme.title}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {catalog.map((giftItem) => {
                            const inventoryItem = inventoryByGiftId.get(giftItem.id)
                            const owned = inventoryItem?.quantity ?? 0
                            const notEnoughBalance = balance < displayPrice
                            const isCurrent = pendingGiftId === giftItem.id
                            const theme = themeByGiftId.get(giftItem.id) ?? GIFT_THEMES[0]

                            return (
                                <article key={giftItem.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="inline-flex items-center gap-3">
                                            <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                                <Image
                                                    src={theme.imagePath}
                                                    alt={theme.title}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{theme.title}</p>
                                                <p className="text-[11px] text-slate-500">{theme.subtitle}</p>
                                                <p className="text-xs text-slate-500">{displayPrice} coins</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-[var(--accent-warm)] px-2 py-1 text-xs font-semibold text-slate-700">
                                            Owned: {owned}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            type="button"
                                            className="w-full"
                                            disabled={isBuying || notEnoughBalance}
                                            onClick={() => handleBuyGift(giftItem.id)}
                                        >
                                            <Gift className="h-4 w-4" />
                                            {isCurrent ? 'Buying...' : notEnoughBalance ? 'Not enough credits' : 'Buy gift'}
                                        </Button>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </QueryState>
            </AppSectionCard>

            <AppSectionCard title="My Gift Library" description="Gifts currently in your inventory.">
                <QueryState
                    isLoading={inventoryQuery.isLoading}
                    isError={inventoryQuery.isError}
                    error={inventoryQuery.error}
                    isEmpty={!inventoryQuery.isLoading && !inventoryQuery.isError && inventory.length === 0}
                    emptyMessage="You don't own gifts yet. Buy one from catalog."
                    loadingMessage="Loading gift inventory..."
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {inventory.map((item, index) => {
                            const theme =
                                themeByGiftId.get(item.giftId) ??
                                resolveThemeFromText(`${item.giftId} ${item.giftName}`) ??
                                GIFT_THEMES[index % GIFT_THEMES.length]

                            return (
                                <article key={item.giftId} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                                    <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                        <Image src={theme.imagePath} alt={theme.title} fill sizes="44px" className="object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-900">{theme.title}</p>
                                        <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </QueryState>
            </AppSectionCard>
        </AppPageShell>
    )
}
