import { cn } from '@/shared/lib/css/utils'

type SpotlightProps = {
    className?: string
    color?: string
}

export function Spotlight({ className, color = 'rgba(235,76,76,0.34)' }: SpotlightProps) {
    return (
        <div
            aria-hidden="true"
            className={cn('pointer-events-none absolute rounded-full blur-3xl spotlight-animate', className)}
            style={{ background: color }}
        />
    )
}
