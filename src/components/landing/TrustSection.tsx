'use client'

import { Reveal } from '@/components/landing/magic/Reveal'
import DecryptedText from '@/shared/components/DecryptedText'
import BounceCards from '@/shared/components/BounceCards'

const coupleImages = [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=500&h=500&fit=crop',
]

const transformStyles = [
    'rotate(12deg) translate(-390px)',
    'rotate(7deg) translate(-260px)',
    'rotate(3deg) translate(-130px)',
    'rotate(-2deg)',
    'rotate(-5deg) translate(130px)',
    'rotate(-9deg) translate(260px)',
    'rotate(-12deg) translate(390px)',
]

export function TrustSection() {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-end">
                <Reveal>
                    <h2 className="font-heading max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                        <DecryptedText
                            text="Focused on compatibility, building real connections"
                            animateOn="view"
                            sequential={true}
                            speed={60}
                            revealDirection="start"
                            encryptedClassName="text-[var(--accent-subtle)]"
                        />
                    </h2>
                </Reveal>
                <Reveal delayMs={120}>
                    <p className="max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                        AlgoLove is designed for people who want to date with clarity. Compatibility
                        signals, values, and lifestyle alignment are surfaced upfront so
                        conversations start with purpose.
                    </p>
                </Reveal>
            </div>

            <Reveal delayMs={180} className="mt-20">
                <div className="flex justify-center">
                    <BounceCards
                        className="w-full"
                        images={coupleImages}
                        containerWidth={1100}
                        containerHeight={320}
                        animationDelay={0.3}
                        animationStagger={0.08}
                        transformStyles={transformStyles}
                        enableHover={true}
                    />
                </div>
            </Reveal>
        </section>
    )
}
