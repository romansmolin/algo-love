'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LogIn, Menu, UserPlus, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/components/landing/Logo'

const links = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 border-b border-white/20 bg-[color:rgba(246,247,251,0.82)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="#">
                    <Logo />
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} className="text-sm text-slate-600 transition hover:text-slate-900">
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Button asChild variant="outline">
                        <a href="/auth/sign-in">
                            <LogIn className="h-4 w-4" />
                            Log in
                        </a>
                    </Button>
                    <Button asChild>
                        <a href="/auth/sign-up">
                            <UserPlus className="h-4 w-4" />
                            Create account
                        </a>
                    </Button>
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <Button asChild variant="outline" size="sm">
                        <a href="/auth/sign-in">
                            <LogIn className="h-4 w-4" />
                            Log in
                        </a>
                    </Button>
                    <Button asChild size="sm">
                        <a href="/auth/sign-up">
                            <UserPlus className="h-4 w-4" />
                            Sign up
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        onClick={() => setIsOpen((prev) => !prev)}
                    >
                        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm md:hidden">
                    <nav className="flex flex-col gap-2">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}
