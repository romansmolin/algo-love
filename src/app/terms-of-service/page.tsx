import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service | AlgoLove',
    description: 'Terms and conditions for using the AlgoLove dating platform.',
}

export default function TermsOfServicePage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900">
                &larr; Back to home
            </Link>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Terms of Service</h1>
            <p className="mt-3 text-sm text-slate-500">Last updated: March 29, 2026</p>

            <div className="prose-slate mt-10 space-y-8 text-slate-700">
                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
                    <p className="mt-3 leading-relaxed">
                        By creating an account or using AlgoLove (&quot;the Service&quot;), you agree to be bound by these
                        Terms of Service (&quot;Terms&quot;), our <Link href="/privacy-policy" className="text-[var(--accent)] underline">Privacy Policy</Link>,
                        and our <Link href="/cookies-policy" className="text-[var(--accent)] underline">Cookies Policy</Link>.
                        If you do not agree to all of these terms, do not use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">2. Eligibility</h2>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li>You must be at least 18 years of age to use AlgoLove.</li>
                        <li>You must be legally able to enter into a binding contract in your jurisdiction.</li>
                        <li>You must not be prohibited from using the Service under applicable law.</li>
                        <li>You must not have been previously banned or removed from AlgoLove.</li>
                    </ul>
                    <p className="mt-3 leading-relaxed">
                        By using the Service, you represent and warrant that you meet all eligibility requirements.
                        We reserve the right to verify your age and identity at any time.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">3. Your Account</h2>
                    <p className="mt-3 leading-relaxed">
                        You are responsible for maintaining the confidentiality of your login credentials and for all
                        activity that occurs under your account. You agree to:
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li>Provide accurate, current, and complete information during registration.</li>
                        <li>Keep your profile information up to date.</li>
                        <li>Not create more than one account per person.</li>
                        <li>Not transfer or share your account with anyone else.</li>
                        <li>Notify us immediately of any unauthorized access to your account.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">4. Compatibility Scoring &amp; Matching</h2>
                    <p className="mt-3 leading-relaxed">
                        AlgoLove uses algorithmic compatibility scoring based on your values, personality traits,
                        lifestyle preferences, and relationship intent. You acknowledge and agree that:
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li>Compatibility scores are algorithmic estimates and do not guarantee relationship success.</li>
                        <li>Match quality depends on the accuracy and completeness of the information you provide.</li>
                        <li>We may adjust our matching algorithms at any time to improve the Service.</li>
                        <li>Daily match limits and scoring features may vary based on your subscription tier.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">5. User Conduct</h2>
                    <p className="mt-3 leading-relaxed">You agree not to:</p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li>Use the Service for any unlawful purpose or to solicit others to perform illegal activities.</li>
                        <li>Harass, bully, intimidate, stalk, or threaten any other user.</li>
                        <li>Post content that is defamatory, obscene, hateful, discriminatory, or sexually explicit.</li>
                        <li>Impersonate any person or entity, or misrepresent your identity, age, or affiliations.</li>
                        <li>Use the Service to promote commercial products, services, or spam.</li>
                        <li>Attempt to extract data from other users&apos; profiles through scraping or automated means.</li>
                        <li>Interfere with or disrupt the Service, servers, or networks connected to the Service.</li>
                        <li>Use bots, scripts, or automated tools to interact with the platform.</li>
                        <li>Share another user&apos;s personal information, photos, or messages without their consent.</li>
                    </ul>
                    <p className="mt-3 leading-relaxed">
                        Violation of these rules may result in immediate account suspension or permanent ban,
                        at our sole discretion.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">6. Content You Post</h2>
                    <p className="mt-3 leading-relaxed">
                        You retain ownership of the content you upload (photos, text, etc.). By posting content on AlgoLove,
                        you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and
                        distribute your content solely for operating and improving the Service. This license ends when
                        you delete your content or account, except where your content has been shared with other users
                        who have not deleted it.
                    </p>
                    <p className="mt-3 leading-relaxed">
                        We reserve the right to remove content that violates these Terms or that we find objectionable,
                        without prior notice.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">7. Subscriptions &amp; Payments</h2>
                    <p className="mt-3 leading-relaxed">
                        AlgoLove may offer free and paid subscription tiers. For paid subscriptions:
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li>Payments are processed securely through our third-party payment provider.</li>
                        <li>Subscriptions renew automatically at the end of each billing cycle unless canceled.</li>
                        <li>You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.</li>
                        <li>Prices may change with 30 days&apos; notice. Continued use after a price change constitutes acceptance.</li>
                        <li>Credits and virtual gifts purchased are non-transferable between accounts.</li>
                    </ul>
                    <p className="mt-3 leading-relaxed">
                        For refund eligibility, see our <Link href="/return-policy" className="text-[var(--accent)] underline">Return &amp; Refund Policy</Link>.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">8. Safety &amp; Reporting</h2>
                    <p className="mt-3 leading-relaxed">
                        Your safety is important to us. AlgoLove provides tools to block and report users. We encourage
                        you to report any behavior that violates these Terms or makes you feel unsafe. We will review
                        all reports and take appropriate action, which may include warnings, temporary suspensions,
                        or permanent bans.
                    </p>
                    <p className="mt-3 leading-relaxed">
                        While we strive to create a safe environment, we cannot guarantee the behavior of other users.
                        Always exercise caution when meeting someone in person for the first time.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">9. Disclaimers</h2>
                    <p className="mt-3 leading-relaxed">
                        The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether
                        express or implied. We do not warrant that the Service will be uninterrupted, error-free,
                        or secure. We do not guarantee any specific outcomes from using the Service, including
                        finding a compatible partner.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">10. Limitation of Liability</h2>
                    <p className="mt-3 leading-relaxed">
                        To the maximum extent permitted by law, AlgoLove and its officers, directors, employees, and
                        agents shall not be liable for any indirect, incidental, special, consequential, or punitive
                        damages arising from your use of the Service, including but not limited to emotional distress,
                        loss of data, or loss of profits, regardless of the theory of liability.
                    </p>
                    <p className="mt-3 leading-relaxed">
                        Our total liability for any claim arising from the Service shall not exceed the amount you
                        have paid to AlgoLove in the 12 months preceding the claim.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">11. Termination</h2>
                    <p className="mt-3 leading-relaxed">
                        You may delete your account at any time through your profile settings. We may suspend or
                        terminate your account at any time for violating these Terms, with or without notice. Upon
                        termination, your right to use the Service ceases immediately. Sections that by their nature
                        should survive termination will remain in effect.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">12. Governing Law &amp; Disputes</h2>
                    <p className="mt-3 leading-relaxed">
                        These Terms are governed by the laws of the State of California, without regard to conflict
                        of law provisions. Any disputes arising from these Terms or the Service shall be resolved
                        through binding arbitration in accordance with the rules of the American Arbitration Association,
                        except that either party may seek injunctive relief in a court of competent jurisdiction.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">13. Changes to Terms</h2>
                    <p className="mt-3 leading-relaxed">
                        We reserve the right to modify these Terms at any time. We will provide at least 14 days&apos;
                        notice of material changes via email or in-app notification. Your continued use of the
                        Service after the effective date constitutes acceptance of the updated Terms.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">14. Contact</h2>
                    <p className="mt-3 leading-relaxed">
                        Questions about these Terms? Contact us at:
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>AlgoLove Legal Team</strong><br />
                        Email: <span className="font-medium text-slate-900">legal@algolove.com</span>
                    </p>
                </section>
            </div>
        </div>
    )
}
