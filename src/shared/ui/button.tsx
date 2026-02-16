import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/css/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-[#EB4C4C] text-white shadow-sm hover:bg-[#FF7070]',
                secondary: 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-[#FFEDC7]',
                outline: 'border border-slate-300 bg-transparent text-slate-800 hover:bg-[#FFEDC7]',
                ghost: 'text-slate-800 hover:bg-slate-100',
            },
            size: {
                default: 'h-10 px-5',
                sm: 'h-8 px-3 text-xs',
                lg: 'h-11 px-6 text-base',
                icon: 'h-10 w-10 rounded-full',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
