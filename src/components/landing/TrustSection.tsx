import { Reveal } from '@/components/landing/magic/Reveal'

const logos = ['Northline', 'Mosaic', 'Headspace', 'Medtronic', 'Tempo']

export function TrustSection() {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-end">
                <Reveal>
                    <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                        Focused on compatibility, building real connections
                    </h2>
                </Reveal>
                <Reveal delayMs={120}>
                    <p className="max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                        AlgoLove is designed for people who want to date with clarity. Compatibility signals, values,
                        and lifestyle alignment are surfaced upfront so conversations start with purpose.
                    </p>
                </Reveal>
            </div>

            <Reveal delayMs={180} className="mt-10">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {logos.map((logo) => (
                        <div
                            key={logo}
                            className="grid h-20 w-20 place-items-center rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-500 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.55)] sm:h-24 sm:w-24 sm:text-sm"
                        >
                            {logo}
                        </div>
                    ))}
                </div>
            </Reveal>
        </section>
    )
}
