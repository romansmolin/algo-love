import { SignUpForm } from '@/features/auth'

export default function SignUpPage() {
    return (
        <section className="container mx-auto px-4 py-8 sm:px-6 sm:pb-12 lg:px-8">
            <div className="mx-auto h-[80vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="mb-6 space-y-2 text-center">
                    <h1 className="text-2xl font-bold sm:text-3xl">Create your account</h1>
                    <p className="text-sm text-muted-foreground">
                        Join Pairly and start building meaningful connections.
                    </p>
                </div>
                <SignUpForm />
            </div>
        </section>
    )
}
