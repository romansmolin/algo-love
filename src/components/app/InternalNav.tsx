'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/css/utils'

const links = [
    { href: '/dashboard', label: 'Home' },
    { href: '/gifts', label: 'Gifts' },
    { href: '/chat', label: 'Chat' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/profile', label: 'Settings' },
    { href: '/match', label: 'Match' },
]

export function InternalNav() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-wrap items-center gap-2" aria-label="Application navigation">
            {links.map((link) => {
                const isActive = pathname === link.href

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            'rounded-full border px-3 py-1.5 text-sm transition',
                            isActive
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-[var(--accent-warm)]',
                        )}
                    >
                        {link.label}
                    </Link>
                )
            })}
        </nav>
    )
}
