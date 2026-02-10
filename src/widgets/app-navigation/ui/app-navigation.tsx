'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
import { Heart, LayoutDashboard } from 'lucide-react'
import { cn } from '@/shared/lib/css/utils'

type AppNavigationProps = {
    className?: string
    orientation?: 'vertical' | 'horizontal'
}

type NavItem = {
    label: string
    href: string
    icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Start Matching',
        href: '/match',
        icon: Heart,
    },
]

const isItemActive = (pathname: string, href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNavigation({ className, orientation = 'vertical' }: AppNavigationProps) {
    const pathname = usePathname()

    return (
        <nav className={className} aria-label="App navigation">
            <ul
                className={cn(
                    'flex gap-2',
                    orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
                )}
            >
                {navItems.map((item) => {
                    const active = isItemActive(pathname, item.href)
                    const Icon = item.icon

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={cn(
                                    'inline-flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
                                    active
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-background hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                <Icon className="size-4" />
                                {item.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
