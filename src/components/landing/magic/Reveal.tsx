'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/css/utils'

type RevealProps = {
    children: ReactNode
    className?: string
    delayMs?: number
}

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const target = ref.current
        if (!target) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.15,
            },
        )

        observer.observe(target)

        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delayMs}ms` }}
            className={cn(
                'transform-gpu transition-all duration-700 ease-out will-change-transform',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                className,
            )}
        >
            {children}
        </div>
    )
}
