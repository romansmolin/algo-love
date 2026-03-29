import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Return & Refund Policy | AlgoLove',
    description: 'Refund eligibility, cancellation terms, and how to request a refund on AlgoLove.',
}

export default function ReturnPolicyPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900">
                &larr; Back to home
            </Link>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Return &amp; Refund Policy</h1>
            <p className="mt-3 text-sm text-slate-500">Last updated: March 29, 2026</p>

            <div className="prose-slate mt-10 space-y-8 text-slate-700">
                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">1. Overview</h2>
                    <p className="mt-3 leading-relaxed">
                        AlgoLove offers both free and paid features, including premium subscriptions, credit packs,
                        and virtual gifts. This Return &amp; Refund Policy explains when you are eligible for a refund
                        and how to request one.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">2. Subscription Refunds</h2>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">2.1 Cooling-Off Period</h3>
                    <p className="mt-2 leading-relaxed">
                        If you purchased a premium subscription, you may request a full refund within <strong>14 days</strong> of
                        your initial purchase, provided you have not used premium-exclusive features (e.g., viewing
                        compatibility breakdowns, sending unlimited messages to matches). This cooling-off period
                        applies to first-time subscription purchases only.
                    </p>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">2.2 Renewal Refunds</h3>
                    <p className="mt-2 leading-relaxed">
                        If your subscription auto-renewed and you did not intend to continue, you may request a
                        refund within <strong>48 hours</strong> of the renewal charge. After 48 hours, renewal charges are
                        non-refundable, but you may cancel to prevent future renewals.
                    </p>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">2.3 Mid-Cycle Cancellation</h3>
                    <p className="mt-2 leading-relaxed">
                        If you cancel your subscription mid-cycle, you will retain access to premium features until
                        the end of the current billing period. No partial or prorated refunds are issued for
                        mid-cycle cancellations outside the cooling-off and renewal windows above.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">3. Credits &amp; Virtual Gifts</h2>
                    <p className="mt-3 leading-relaxed">
                        Purchased credits and virtual gifts are <strong>non-refundable</strong> once they have been used
                        (e.g., a gift has been sent to another user). Unused credits may be eligible for a refund
                        within 14 days of purchase if:
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li>No credits from the purchase have been spent.</li>
                        <li>The credit balance is fully intact at the time of the request.</li>
                    </ul>
                    <p className="mt-3 leading-relaxed">
                        Bonus or promotional credits are never refundable and will be deducted first when credits are used.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">4. Exceptions</h2>
                    <p className="mt-3 leading-relaxed">We may issue refunds outside the standard policy in cases of:</p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li><strong>Billing errors:</strong> Duplicate charges, incorrect amounts, or charges after account deletion.</li>
                        <li><strong>Service outages:</strong> Extended platform unavailability (more than 72 consecutive hours) during your billing period.</li>
                        <li><strong>Unauthorized charges:</strong> If your payment method was used without your consent, pending our investigation.</li>
                        <li><strong>Legal requirements:</strong> Where local consumer protection laws mandate additional refund rights.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">5. How to Request a Refund</h2>
                    <p className="mt-3 leading-relaxed">To request a refund:</p>
                    <ol className="mt-3 list-decimal space-y-2 pl-6">
                        <li>Email <span className="font-medium text-slate-900">billing@algolove.com</span> with the subject line &quot;Refund Request.&quot;</li>
                        <li>Include your account email, the date and amount of the charge, and a brief reason for the request.</li>
                        <li>We will review your request and respond within <strong>5 business days</strong>.</li>
                        <li>Approved refunds are processed to the original payment method within <strong>7&ndash;10 business days</strong>.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">6. App Store Purchases</h2>
                    <p className="mt-3 leading-relaxed">
                        If you purchased a subscription or credits through the Apple App Store or Google Play Store,
                        refund requests must be made directly through the respective store. AlgoLove cannot process
                        refunds for purchases made through third-party app stores.
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li><strong>Apple:</strong> Request a refund at <span className="font-medium text-slate-900">reportaproblem.apple.com</span></li>
                        <li><strong>Google:</strong> Request a refund through Google Play &gt; Order History</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">7. Account Termination &amp; Refunds</h2>
                    <p className="mt-3 leading-relaxed">
                        If your account is terminated by AlgoLove due to a violation of our
                        <Link href="/terms-of-service" className="text-[var(--accent)] underline"> Terms of Service</Link>,
                        you are not entitled to a refund for any remaining subscription time, credits, or virtual gifts.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">8. Contact</h2>
                    <p className="mt-3 leading-relaxed">
                        For billing questions or refund inquiries:
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>AlgoLove Billing Team</strong><br />
                        Email: <span className="font-medium text-slate-900">billing@algolove.com</span>
                    </p>
                </section>
            </div>
        </div>
    )
}
