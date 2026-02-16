import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

type AppSectionCardProps = {
    title: string
    description?: string
    actions?: ReactNode
    children: ReactNode
}

export function AppSectionCard({ title, description, actions, children }: AppSectionCardProps) {
    return (
        <Card className="rounded-3xl">
            <CardHeader className="pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-xl">{title}</CardTitle>
                        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
                    </div>
                    {actions ? <div className="shrink-0">{actions}</div> : null}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}
