'use client'

import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/shared/store/store'
import { AIUnlockGateProvider } from '@/components/ai'

type ProvidersProps = {
    children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <Provider store={store}>
            <AIUnlockGateProvider>{children}</AIUnlockGateProvider>
        </Provider>
    )
}
