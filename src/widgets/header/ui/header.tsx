import { Button } from '@/shared/ui/button'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { SheetTrigger, SheetContent, SheetHeader, SheetTitle, Sheet } from '@/shared/ui/sheet'
import { Separator } from '@/shared/ui/separator'

const navigationMenu = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Safety', href: '#safety' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Stories', href: '#stories' },
    { label: 'FAQ', href: '#faq' },
]

export const Header = () => {
    return (
        <header className="container mx-auto p-4 mt-5 flex justify-between items-center">
            <div>
                <span className="text-2xl text-primary font-bold tracking-wider">Pairly</span>
            </div>
            <nav className="hidden sm:block">
                <ul className="flex gap-8 text-lg">
                    {navigationMenu.map((menuItem) => (
                        <Link
                            key={menuItem.href}
                            href={menuItem.href}
                            className="hover:text-primary duration-300 font-bold"
                        >
                            {menuItem.label}
                        </Link>
                    ))}
                </ul>
            </nav>
            <div className="hidden sm:flex gap-3">
                <Button>Sign Up</Button>
                <Button variant={'outline'}>Get started</Button>
            </div>

            {/* MOBILE VIEW */}

            <Sheet>
                <SheetTrigger asChild className="sm:hidden">
                    <Button size={'icon'} variant={'outline'} className="border border-dashed">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent className="felx flex-col gap-2 p-2">
                    <SheetHeader>
                        <SheetTitle className="text-xl text-primary">
                            Pairly | Find The Love ❤️
                        </SheetTitle>
                    </SheetHeader>

                    <Separator className="bg-primary" />

                    <ul className="flex flex-col text-lg gap-5 p-4">
                        {navigationMenu.map((menuItem) => (
                            <Link
                                key={menuItem.href}
                                href={menuItem.href}
                                className="hover:text-primary duration-300 font-bold"
                            >
                                {menuItem.label}
                            </Link>
                        ))}
                    </ul>

                    <Separator className="bg-primary" />

                    <div className="flex gap-3 p-4">
                        <Button className="flex-1">Sign Up</Button>
                        <Button className="flex-1" variant={'outline'}>
                            Get started
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    )
}
