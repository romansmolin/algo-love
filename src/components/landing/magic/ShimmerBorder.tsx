import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/css/utils'

type ShimmerBorderProps = {
    children: ReactNode
    className?: string
    contentClassName?: string
    borderClassName?: string
}

export function ShimmerBorder({
    children,
    className,
    contentClassName,
    borderClassName,
}: ShimmerBorderProps) {
    return (
        <div className={cn('relative overflow-hidden rounded-2xl p-px', className)}>
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[color:rgb(255_112_112_/_0.72)] to-transparent shimmer-animate',
                    borderClassName,
                )}
            />
            <div className={cn('relative rounded-[15px]', contentClassName)}>{children}</div>
        </div>
    )
}
