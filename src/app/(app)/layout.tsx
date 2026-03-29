import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/shared/lib/auth/get-session'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()

    // Check both auth systems: Better Auth session token and external dating session
    const betterAuthSession = await getSession()
    const datingSessionId = cookieStore.get('dating_session_id')?.value

    if (!betterAuthSession && !datingSessionId) {
        redirect('/auth/sign-in')
    }

    return <>{children}</>
}
