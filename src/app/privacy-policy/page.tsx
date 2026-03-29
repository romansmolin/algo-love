import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | AlgoLove',
    description: 'How AlgoLove collects, uses, and protects your personal data.',
}

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900">
                &larr; Back to home
            </Link>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-slate-500">Last updated: March 29, 2026</p>

            <div className="prose-slate mt-10 space-y-8 text-slate-700">
                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">1. Introduction</h2>
                    <p className="mt-3 leading-relaxed">
                        AlgoLove (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
                        explains how we collect, use, disclose, and safeguard your information when you use our
                        dating platform, including our website and mobile applications (collectively, the &quot;Service&quot;).
                    </p>
                    <p className="mt-3 leading-relaxed">
                        By using AlgoLove, you agree to the collection and use of information in accordance with this
                        policy. If you do not agree, please do not access or use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">2. Information We Collect</h2>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">2.1 Information You Provide</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-6">
                        <li><strong>Account information:</strong> Name, email address, date of birth, gender, and password when you register.</li>
                        <li><strong>Profile data:</strong> Photos, bio, relationship intent, lifestyle preferences, values, and personality responses used for compatibility scoring.</li>
                        <li><strong>Communications:</strong> Messages you send to other users through our chat feature, as well as communications with our support team.</li>
                        <li><strong>Payment information:</strong> Billing details processed through our third-party payment processor. We do not store full credit card numbers.</li>
                        <li><strong>Verification data:</strong> Identity verification documents if you opt into profile verification.</li>
                    </ul>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">2.2 Information Collected Automatically</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-6">
                        <li><strong>Usage data:</strong> Pages visited, features used, time spent on the platform, match interactions, and search preferences.</li>
                        <li><strong>Device information:</strong> IP address, browser type, operating system, device identifiers, and mobile network information.</li>
                        <li><strong>Location data:</strong> Approximate location derived from your IP address. We do not collect precise GPS location without your explicit consent.</li>
                        <li><strong>Cookies and tracking:</strong> See our <Link href="/cookies-policy" className="text-[var(--accent)] underline">Cookies Policy</Link> for details.</li>
                    </ul>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">2.3 Compatibility Scoring Data</h3>
                    <p className="mt-2 leading-relaxed">
                        Our core feature involves analyzing your values, personality traits, lifestyle preferences, and
                        relationship intent to generate compatibility scores. This data is processed algorithmically and
                        is never shared in raw form with other users. Only the resulting compatibility percentage and
                        high-level alignment categories are visible to your matches.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">3. How We Use Your Information</h2>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li>Provide, maintain, and improve the Service, including generating compatibility scores and curated daily matches.</li>
                        <li>Create and manage your account, verify your identity, and authenticate logins.</li>
                        <li>Facilitate communication between matched users through our messaging system.</li>
                        <li>Process transactions and send related information including purchase confirmations.</li>
                        <li>Send service-related notices, security alerts, and support messages.</li>
                        <li>Detect, investigate, and prevent fraudulent, abusive, or unauthorized activity.</li>
                        <li>Analyze usage patterns to improve our matching algorithms and user experience.</li>
                        <li>Comply with legal obligations and enforce our Terms of Service.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">4. How We Share Your Information</h2>
                    <p className="mt-3 leading-relaxed">
                        We do not sell your personal information. We may share your data in the following circumstances:
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li><strong>With other users:</strong> Your profile information (name, age, photos, bio, intent) is visible to users you are matched with. Compatibility scores are shared only with mutual matches.</li>
                        <li><strong>Service providers:</strong> Third-party vendors who assist with hosting, analytics, payment processing, email delivery, and customer support, bound by data processing agreements.</li>
                        <li><strong>Legal requirements:</strong> When required by law, subpoena, or government request, or to protect the rights, safety, or property of AlgoLove, our users, or the public.</li>
                        <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to users.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">5. Data Retention</h2>
                    <p className="mt-3 leading-relaxed">
                        We retain your personal data for as long as your account is active or as needed to provide the Service.
                        If you delete your account, we will remove your profile data within 30 days, except where retention is
                        required for legal compliance, dispute resolution, or fraud prevention (up to 3 years). Anonymized,
                        aggregated data may be retained indefinitely for analytics.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">6. Your Rights and Choices</h2>
                    <p className="mt-3 leading-relaxed">Depending on your jurisdiction, you may have the right to:</p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li><strong>Access</strong> the personal data we hold about you.</li>
                        <li><strong>Correct</strong> inaccurate or incomplete information.</li>
                        <li><strong>Delete</strong> your account and associated data.</li>
                        <li><strong>Export</strong> your data in a portable format.</li>
                        <li><strong>Restrict</strong> or object to certain processing of your data.</li>
                        <li><strong>Withdraw consent</strong> for data processing where consent is the legal basis.</li>
                    </ul>
                    <p className="mt-3 leading-relaxed">
                        To exercise any of these rights, contact us at <span className="font-medium text-slate-900">privacy@algolove.com</span>.
                        We will respond within 30 days.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">7. Security</h2>
                    <p className="mt-3 leading-relaxed">
                        We implement industry-standard security measures including encryption in transit (TLS 1.3),
                        encryption at rest (AES-256), regular security audits, and access controls. However, no method
                        of electronic transmission or storage is 100% secure. We encourage you to use a strong, unique
                        password and enable two-factor authentication.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">8. International Transfers</h2>
                    <p className="mt-3 leading-relaxed">
                        Your data may be transferred to and processed in countries other than your country of residence.
                        We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs)
                        approved by the European Commission, where applicable.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">9. Children&apos;s Privacy</h2>
                    <p className="mt-3 leading-relaxed">
                        AlgoLove is not intended for individuals under the age of 18. We do not knowingly collect
                        personal information from minors. If we become aware that a user is under 18, we will
                        promptly delete their account and associated data.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">10. Changes to This Policy</h2>
                    <p className="mt-3 leading-relaxed">
                        We may update this Privacy Policy from time to time. We will notify you of material changes
                        via email or an in-app notice at least 14 days before the changes take effect. Continued use
                        of the Service after the effective date constitutes acceptance.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">11. Contact Us</h2>
                    <p className="mt-3 leading-relaxed">
                        If you have questions about this Privacy Policy or our data practices, contact us at:
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>AlgoLove Privacy Team</strong><br />
                        Email: <span className="font-medium text-slate-900">privacy@algolove.com</span><br />
                    </p>
                </section>
            </div>
        </div>
    )
}
