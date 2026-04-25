'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Gift,
    Heart,
    Home,
    MessageCircle,
    Sparkles,
    Sparkle,
    UserCircle2,
    Wallet,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/css/utils'

type NavLink = {
    href: string
    label: string
    icon: LucideIcon
    accent?: boolean
}

type NavGroup = {
    id: string
    label: string
    links: NavLink[]
}

const groups: NavGroup[] = [
    {
        id: 'discover',
        label: 'Discover',
        links: [
            { href: '/dashboard', label: 'Home', icon: Home },
            { href: '/match', label: 'Match', icon: Heart },
            { href: '/interactions', label: 'Interactions', icon: Sparkle },
        ],
    },
    {
        id: 'connect',
        label: 'Connect',
        links: [
            { href: '/chat', label: 'Chat', icon: MessageCircle },
            { href: '/gifts', label: 'Gifts', icon: Gift },
        ],
    },
    {
        id: 'account',
        label: 'Account',
        links: [
            { href: '/wallet', label: 'Wallet', icon: Wallet },
            { href: '/profile', label: 'Settings', icon: UserCircle2 },
            { href: '/ai-unlock', label: 'AI Unlock', icon: Sparkles, accent: true },
        ],
    },
]

const isActiveHref = (pathname: string, href: string): boolean => {
    if (pathname === href) return true
    if (href === '/dashboard') return false
    return pathname.startsWith(`${href}/`)
}

export function InternalNav() {
    const pathname = usePathname()

    return (
        <nav
            aria-label="Application navigation"
            className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            <ul className="flex min-w-max items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                {groups.map((group, groupIndex) => (
                    <li key={group.id} className="contents">
                        {groupIndex > 0 ? (
                            <span
                                aria-hidden="true"
                                className="mx-1 hidden h-5 w-px bg-slate-200 sm:inline-block"
                            />
                        ) : null}
                        {group.links.map((link) => {
                            const isActive = isActiveHref(pathname, link.href)
                            const Icon = link.icon

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    title={`${group.label} · ${link.label}`}
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                                        isActive
                                            ? 'bg-[var(--accent)] text-white shadow-sm'
                                            : link.accent
                                              ? 'border border-dashed border-[var(--accent)]/40 bg-[var(--accent-warm)] text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-warm)]'
                                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </li>
                ))}
            </ul>
        </nav>
    )
}
