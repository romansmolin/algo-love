import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Reveal } from '@/components/landing/magic/Reveal'

const items = [
    'Values-first matching',
    'Personality alignment',
    'Lifestyle compatibility',
    'Intent-based discovery',
]

export function SplitSection() {
    return (
        <section id="how-it-works" className="py-16 sm:py-20">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.2fr] lg:items-start lg:px-8">
                <Reveal className="space-y-6">
                    <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                        Real connections, built differently
                    </h2>
                    <p className="max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                        Compatibility insight leads each recommendation so you can spend less time filtering and more
                        time meeting people that fit your pace, goals, and values.
                    </p>
                    <Button asChild>
                        <a href="#signup" className="inline-flex items-center gap-2">
                            Create account <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </Button>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((item, index) => (
                            <Reveal key={item} delayMs={index * 80}>
                                <Card className="rounded-xl">
                                    <CardContent className="px-4 py-4 text-sm font-medium text-slate-700">{item}</CardContent>
                                </Card>
                            </Reveal>
                        ))}
                    </div>
                </Reveal>

                <Reveal delayMs={140}>
                    <div className="relative h-[380px] overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[var(--accent-warm)] via-[#fff8ef] to-[color:rgb(255_166_166_/_0.46)] shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] sm:h-[460px]">
                        <div className="absolute -right-12 top-8 h-44 w-44 rounded-full bg-white/45 blur-2xl" />
                        <div className="absolute -left-10 bottom-10 h-56 w-56 rounded-full bg-[color:rgb(255_112_112_/_0.52)] blur-2xl" />
                        <div className="absolute inset-6 rounded-[1.4rem] border border-white/50 bg-white/35 backdrop-blur-sm" />
                    </div>
                </Reveal>
            </div>
        </section>
    )
}
