import { Suspense } from 'react'
import { AuthTabsPage } from '@/components/auth'

export default function SignInPage() {
    return (
        <Suspense fallback={null}>
            <AuthTabsPage />
        </Suspense>
    )
}
