import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Reveal } from '@/components/landing/magic/Reveal'
import { Spotlight } from '@/components/landing/magic/Spotlight'

const points = ['Compatibility-first matching', 'Privacy-first profiles', 'Curated daily matches']

export function DarkCTA() {
    return (
        <section id="pricing" className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-slate-100 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.95)] sm:px-10 lg:px-12">
                    <Spotlight className="-left-12 top-5 h-52 w-52 pulse-animate" color="rgba(235,76,76,0.28)" />
                    <Spotlight className="right-0 top-8 h-44 w-44 pulse-animate" color="rgba(255,166,166,0.26)" />
                    <div className="absolute inset-0 magic-noise" />

                    <Reveal className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                        <div>
                            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                                It&apos;s time to date with intention.
                            </h2>
                            <ul className="mt-6 space-y-3">
                                {points.map((point) => (
                                    <li key={point} className="flex items-center gap-2 text-sm text-slate-200 sm:text-base">
                                        <CheckCircle2 className="h-4 w-4 text-[var(--accent-subtle)]" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                            <p className="text-sm leading-relaxed text-slate-300">
                                AlgoLove is built for busy, relationship-oriented people who want quality introductions,
                                not infinite feeds.
                            </p>
                            <Button asChild className="mt-5 w-full">
                                <a href="#signup">Create account</a>
                            </Button>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}
