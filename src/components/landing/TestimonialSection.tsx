import { Quote } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardFooter } from '@/shared/ui/card'
import { Reveal } from '@/components/landing/magic/Reveal'

export function TestimonialSection() {
    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <Reveal>
                    <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                        People are tired of swiping
                    </h2>
                </Reveal>

                <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-stretch">
                    <Reveal>
                        <Card className="h-full rounded-3xl">
                            <CardContent className="space-y-5 pt-8">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:rgb(255_166_166_/_0.35)] text-[var(--accent)]">
                                    <Quote className="h-4 w-4" />
                                </span>
                                <p className="text-lg leading-relaxed text-slate-700">
                                    “AlgoLove feels calmer than every dating app I’ve used. The matches actually make
                                    sense.”
                                </p>
                                <p className="text-sm text-slate-500">Jordan M. — Product Designer, 32</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="secondary">
                                    <a href="#signup">Create account</a>
                                </Button>
                            </CardFooter>
                        </Card>
                    </Reveal>

                    <Reveal delayMs={120}>
                        <div className="relative h-[300px] overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-[var(--accent-warm)] to-[color:rgb(255_166_166_/_0.5)] sm:h-[360px]">
                            <div className="absolute inset-5 rounded-[1.4rem] border border-white/70 bg-white/40 backdrop-blur-sm" />
                            <div className="absolute bottom-6 left-6 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-600">
                                Compatibility over chaos
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}
