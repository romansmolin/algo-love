import type { ReactNode } from 'react'
import { InternalNav } from './InternalNav'

type AppPageShellProps = {
    title: string
    description?: string
    children: ReactNode
}

export function AppPageShell({ title, description, children }: AppPageShellProps) {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <header className="space-y-4">
                <InternalNav />
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
                    {description ? <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{description}</p> : null}
                </div>
            </header>
            <div className="mt-8 space-y-6">{children}</div>
        </section>
    )
}
