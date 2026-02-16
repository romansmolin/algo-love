'use client'

import { ChevronDown } from 'lucide-react'
import { SignUpForm } from '@/components/auth'
import { Reveal } from '@/components/landing/magic/Reveal'
import { ShimmerBorder } from '@/components/landing/magic/ShimmerBorder'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const faqs = [
    {
        question: 'How does compatibility scoring work?',
        answer: 'We combine values, personality, lifestyle, and intent signals to prioritize match quality over volume.',
    },
    {
        question: 'Will AlgoLove have endless swipe feeds?',
        answer: 'No. You receive curated daily recommendations so every profile gets thoughtful attention.',
    },
    {
        question: 'Is profile visibility private by default?',
        answer: 'Yes. You control what appears publicly and when deeper profile details are shared.',
    },
]

export function WaitlistSection() {
    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl space-y-14 px-4 sm:px-6 lg:px-8">
                <div id="faq" className="scroll-mt-24">
                    <Reveal>
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                                Questions before you join?
                            </h2>
                            <p className="mt-3 text-sm text-slate-600 sm:text-base">
                                Here are quick answers about compatibility, pacing, and privacy.
                            </p>
                        </div>
                    </Reveal>

                    <div className="mt-6 grid gap-3">
                        {faqs.map((faq, index) => (
                            <Reveal key={faq.question} delayMs={index * 90}>
                                <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.5)]">
                                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-800 sm:text-base">
                                        {faq.question}
                                        <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
                                    </summary>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                                </details>
                            </Reveal>
                        ))}
                    </div>
                </div>

                <Reveal>
                    <div id="signup" className="scroll-mt-24">
                        <ShimmerBorder contentClassName="rounded-[15px] bg-white" className="rounded-2xl">
                            <Card className="border-none shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-2xl sm:text-3xl">Create your AlgoLove account</CardTitle>
                                    <p className="text-sm text-slate-600 sm:text-base">
                                        Start now with full compatibility-first onboarding and access your dashboard right after sign-up.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <SignUpForm
                                        variant="landing"
                                        submitLabel="Create account"
                                        onSuccessRedirect="/dashboard"
                                    />
                                </CardContent>
                            </Card>
                        </ShimmerBorder>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}
