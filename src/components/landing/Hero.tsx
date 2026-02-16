import { Heart, MessageCircleMore, Sparkles } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Reveal } from '@/components/landing/magic/Reveal'
import { Spotlight } from '@/components/landing/magic/Spotlight'

export function Hero() {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
            <div className="relative overflow-visible rounded-[2.2rem] border border-slate-200/70 bg-gradient-to-br from-[#5b1515] via-[#a13232] to-[var(--accent)] px-6 py-10 text-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.85)] sm:px-10 lg:px-12 lg:py-14">
                <Spotlight className="-top-12 left-12 h-44 w-44" color="rgba(255,112,112,0.36)" />
                <Spotlight className="right-8 top-16 h-52 w-52" color="rgba(255,166,166,0.26)" />

                <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-10">
                    <Reveal className="space-y-6">
                        <Badge className="bg-white/15 text-white ring-1 ring-white/20">Compatibility-first dating</Badge>
                        <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.6rem]">
                            Dating without the guessing.
                        </h1>
                        <p className="max-w-lg text-base text-slate-200 sm:text-lg">
                            AlgoLove matches you using compatibility scoring so you meet people who actually fit your
                            life.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button asChild size="lg">
                                <a href="#signup">Create account</a>
                            </Button>
                            <Button asChild variant="secondary" size="lg">
                                <a href="#how-it-works">How it works</a>
                            </Button>
                        </div>
                    </Reveal>

                    <Reveal delayMs={120} className="relative flex items-center justify-center lg:justify-end">
                        <Card className="w-full max-w-sm rounded-3xl border-white/20 bg-white/10 text-white backdrop-blur-xl">
                            <CardContent className="space-y-5 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Today&apos;s best fit</p>
                                        <h3 className="mt-1 text-xl font-semibold">Maya, 31</h3>
                                    </div>
                                    <Badge className="bg-[color:rgb(255_166_166_/_0.24)] text-white ring-1 ring-[color:rgb(255_166_166_/_0.5)]">
                                        94% fit
                                    </Badge>
                                </div>

                                <div className="h-44 rounded-2xl border border-white/15 bg-gradient-to-br from-[color:rgb(255_237_199_/_0.35)] via-white/5 to-[color:rgb(255_166_166_/_0.32)]" />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-200">Values alignment</span>
                                        <span className="font-medium">96%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/15">
                                        <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-[var(--accent-soft)] to-[var(--accent)]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                                    <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                        <p className="text-xs text-slate-300">Intent</p>
                                        <p className="mt-1 font-medium">Long-term</p>
                                    </div>
                                    <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                        <p className="text-xs text-slate-300">Lifestyle</p>
                                        <p className="mt-1 font-medium">Active + calm</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-slate-200">
                                    <span className="inline-flex items-center gap-2 text-sm">
                                        <MessageCircleMore className="h-4 w-4" /> Prompt-ready chat
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-sm">
                                        <Heart className="h-4 w-4 text-[var(--accent-subtle)]" /> Intent match
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Reveal>
                </div>

                <div className="relative mt-8 lg:absolute lg:-bottom-10 lg:right-8 lg:mt-0">
                    <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-slate-900 shadow-xl lg:w-[420px]">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <p className="text-2xl font-semibold">92%</p>
                                <p className="mt-1 text-xs text-slate-500">match satisfaction</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">12K</p>
                                <p className="mt-1 text-xs text-slate-500">users joined</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">3 min</p>
                                <p className="mt-1 text-xs text-slate-500">avg daily usage</p>
                            </div>
                        </div>
                        <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-600">
                            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" /> Built for intentional singles
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
