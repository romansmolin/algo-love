import { HeartHandshake } from 'lucide-react'

interface LogoProps {
    size?: 'sm' | 'md'
}

export function Logo({ size = 'md' }: LogoProps) {
    const iconBox = size === 'sm' ? 'h-7 w-7 rounded-lg' : 'h-8 w-8 rounded-xl'
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
    const textSize = size === 'sm' ? 'text-base' : 'text-lg'

    return (
        <span className="inline-flex items-center gap-2">
            <span className={`${iconBox} inline-flex items-center justify-center bg-[var(--accent)] shadow-[0_2px_8px_rgba(235,76,76,0.35)]`}>
                <HeartHandshake className={`${iconSize} text-white`} />
            </span>
            <span className={`${textSize} font-heading font-bold tracking-tight text-slate-900`}>
                AlgoLove
            </span>
        </span>
    )
}
