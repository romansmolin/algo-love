import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
    title: 'AlgoLove | Compatibility-first dating',
    description:
        'AlgoLove helps intentional singles find compatible matches faster using compatibility scoring, not endless swiping.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Providers>
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    )
}
