'use client'

import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { AppNavigation } from '@/widgets/app-navigation'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/shared/ui/sheet'

type AppShellProps = {
    children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <aside className="hidden lg:block">
                    <div className="sticky top-24 rounded-2xl border border-border bg-card p-4">
                        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">App Menu</h2>
                        <AppNavigation />
                    </div>
                </aside>

                <div className="min-w-0 pb-8">
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3 lg:hidden">
                        <p className="text-sm font-semibold">App Menu</p>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="icon-sm" variant="outline" aria-label="Open app menu">
                                    <Menu className="size-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[18rem] p-4">
                                <SheetHeader className="p-0">
                                    <SheetTitle>App Navigation</SheetTitle>
                                    <SheetDescription>
                                        Open dashboard or start matching.
                                    </SheetDescription>
                                </SheetHeader>
                                <Separator className="my-4" />
                                <AppNavigation />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    )
}
