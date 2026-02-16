import {
    CalendarCheck2,
    MessageCircleHeart,
    Scale,
    ShieldCheck,
    Target,
    UserRoundCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Reveal } from '@/components/landing/magic/Reveal'
import { ShimmerBorder } from '@/components/landing/magic/ShimmerBorder'

const features = [
    {
        icon: Scale,
        title: 'Compatibility scoring',
        copy: 'See values, communication style, and lifestyle fit before you invest energy in messaging.',
    },
    {
        icon: CalendarCheck2,
        title: 'Curated daily matches',
        copy: 'Get a small, quality-first set of matches each day instead of endless swiping loops.',
    },
    {
        icon: MessageCircleHeart,
        title: 'Smart conversation prompts',
        copy: 'Context-aware prompts help you open naturally and avoid awkward first-message friction.',
    },
    {
        icon: Target,
        title: 'Clear dating intent',
        copy: 'Profiles prioritize relationship goals so everyone is explicit about what they are seeking.',
    },
    {
        icon: ShieldCheck,
        title: 'Privacy controls',
        copy: 'Fine-grained profile visibility keeps your personal details protected until you choose to share.',
    },
    {
        icon: UserRoundCheck,
        title: 'Safer interactions',
        copy: 'Intent signals and profile hygiene checks help reduce low-effort engagement and noise.',
    },
]

export function FeaturesGrid() {
    return (
        <section id="features" className="bg-[#fff3df] py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <Reveal>
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                            Dating should feel intentional, not endless
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Every part of AlgoLove is built to help you find compatibility faster and reduce random
                            swipe fatigue.
                        </p>
                    </div>
                </Reveal>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon

                        return (
                            <Reveal key={feature.title} delayMs={60 * index}>
                                <ShimmerBorder
                                    className="h-full"
                                    borderClassName="via-[color:rgb(235_76_76_/_0.52)]"
                                    contentClassName="h-full rounded-[15px] bg-white"
                                >
                                    <Card className="h-full border-none shadow-none">
                                        <CardHeader className="pb-3">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:rgb(255_166_166_/_0.35)] text-[var(--accent)]">
                                                <Icon className="h-4 w-4" />
                                            </span>
                                        </CardHeader>
                                        <CardContent>
                                            <CardTitle className="text-base">{feature.title}</CardTitle>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.copy}</p>
                                        </CardContent>
                                    </Card>
                                </ShimmerBorder>
                            </Reveal>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
