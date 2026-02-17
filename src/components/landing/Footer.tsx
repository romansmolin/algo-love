import { Instagram, Linkedin, Twitter } from 'lucide-react'
import { FooterBankingInfo } from '@/components/landing/FooterBankingInfo'
import { Separator } from '@/shared/ui/separator'

const nav = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
]

const legal = [
    { href: '#', label: 'Privacy' },
    { href: '#', label: 'Terms' },
]

export function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                            <span className="text-lg font-semibold tracking-tight text-slate-900">AlgoLove</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">Compatibility-first dating for intentional people.</p>
                    </div>

                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                        {nav.map((item) => (
                            <a key={item.label} href={item.href} className="transition hover:text-slate-900">
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 text-slate-500">
                        <a href="#" aria-label="Twitter" className="rounded-full border border-slate-200 p-2 transition hover:text-slate-800">
                            <Twitter className="h-4 w-4" />
                        </a>
                        <a href="#" aria-label="LinkedIn" className="rounded-full border border-slate-200 p-2 transition hover:text-slate-800">
                            <Linkedin className="h-4 w-4" />
                        </a>
                        <a href="#" aria-label="Instagram" className="rounded-full border border-slate-200 p-2 transition hover:text-slate-800">
                            <Instagram className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <FooterBankingInfo className="h-auto w-full" />
                </div>

                <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} AlgoLove. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        {legal.map((item) => (
                            <a key={item.label} href={item.href} className="transition hover:text-slate-700">
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
