'use client'

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { useAIUnlock } from './useAIUnlock'
import { AILockedModal } from './AILockedModal'

type GateContextValue = {
    isActive: boolean
    isLoading: boolean
    runIfUnlocked: <T>(action: () => T | Promise<T>) => Promise<T | undefined>
    openLockedModal: () => void
    closeLockedModal: () => void
}

const GateContext = createContext<GateContextValue | null>(null)

export function AIUnlockGateProvider({ children }: { children: ReactNode }) {
    const { isActive, isLoading, refetch } = useAIUnlock()
    const [modalOpen, setModalOpen] = useState(false)

    const openLockedModal = useCallback(() => setModalOpen(true), [])
    const closeLockedModal = useCallback(() => setModalOpen(false), [])

    const runIfUnlocked = useCallback(
        async <T,>(action: () => T | Promise<T>): Promise<T | undefined> => {
            // Always re-fetch to catch mid-session expiry before running.
            const fresh = await refetch().unwrap?.().catch(() => undefined)
            const isStillActive = fresh?.isActive ?? isActive

            if (!isStillActive) {
                setModalOpen(true)
                return undefined
            }

            return await action()
        },
        [isActive, refetch],
    )

    const value = useMemo<GateContextValue>(
        () => ({
            isActive,
            isLoading,
            runIfUnlocked,
            openLockedModal,
            closeLockedModal,
        }),
        [isActive, isLoading, runIfUnlocked, openLockedModal, closeLockedModal],
    )

    return (
        <GateContext.Provider value={value}>
            {children}
            <AILockedModal open={modalOpen} onClose={closeLockedModal} />
        </GateContext.Provider>
    )
}

export function useAIUnlockGate(): GateContextValue {
    const context = useContext(GateContext)
    if (!context) {
        throw new Error('useAIUnlockGate must be used within AIUnlockGateProvider')
    }
    return context
}
