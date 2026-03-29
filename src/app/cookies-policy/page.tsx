import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Cookies Policy | AlgoLove',
    description: 'How AlgoLove uses cookies and similar tracking technologies.',
}

export default function CookiesPolicyPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900">
                &larr; Back to home
            </Link>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Cookies Policy</h1>
            <p className="mt-3 text-sm text-slate-500">Last updated: March 29, 2026</p>

            <div className="prose-slate mt-10 space-y-8 text-slate-700">
                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">1. What Are Cookies?</h2>
                    <p className="mt-3 leading-relaxed">
                        Cookies are small text files placed on your device when you visit a website. They are widely
                        used to make websites work efficiently, provide a better user experience, and give site owners
                        usage information. AlgoLove uses cookies and similar technologies (local storage, session storage,
                        and tracking pixels) to operate and improve our Service.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">2. Types of Cookies We Use</h2>

                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-900">Category</th>
                                    <th className="px-4 py-3 font-semibold text-slate-900">Purpose</th>
                                    <th className="px-4 py-3 font-semibold text-slate-900">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-4 py-3 font-medium text-slate-800">Strictly Necessary</td>
                                    <td className="px-4 py-3">Authentication, session management, security (CSRF protection). The Service cannot function without these.</td>
                                    <td className="px-4 py-3 whitespace-nowrap">Session &ndash; 30 days</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-slate-800">Functional</td>
                                    <td className="px-4 py-3">Remember your preferences such as language, theme (light/dark mode), and notification settings.</td>
                                    <td className="px-4 py-3 whitespace-nowrap">Up to 1 year</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-slate-800">Analytics</td>
                                    <td className="px-4 py-3">Understand how users interact with the Service, which pages are most visited, and where users drop off. Helps us improve matching and onboarding flows.</td>
                                    <td className="px-4 py-3 whitespace-nowrap">Up to 2 years</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-slate-800">Marketing</td>
                                    <td className="px-4 py-3">Deliver relevant ads to potential users on other platforms and measure campaign effectiveness. These are only used on marketing pages, not within the app.</td>
                                    <td className="px-4 py-3 whitespace-nowrap">Up to 1 year</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">3. Specific Cookies We Use</h2>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">3.1 First-Party Cookies</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-6">
                        <li><strong>session_token:</strong> Maintains your authenticated session. Strictly necessary. Expires after 30 days or on logout.</li>
                        <li><strong>csrf_token:</strong> Prevents cross-site request forgery attacks. Strictly necessary. Session-based.</li>
                        <li><strong>theme_preference:</strong> Stores your light/dark mode preference. Functional. 1 year.</li>
                        <li><strong>cookie_consent:</strong> Records your cookie consent choice. Strictly necessary. 1 year.</li>
                    </ul>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">3.2 Third-Party Cookies</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-6">
                        <li><strong>Analytics provider:</strong> We use privacy-focused analytics to collect anonymous usage data. No personally identifiable information is shared.</li>
                        <li><strong>Payment processor:</strong> Our payment provider may set cookies to prevent fraud and process transactions securely.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">4. How to Manage Cookies</h2>
                    <p className="mt-3 leading-relaxed">You can control cookies in several ways:</p>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">4.1 Browser Settings</h3>
                    <p className="mt-2 leading-relaxed">
                        Most browsers allow you to block or delete cookies through their settings. Note that blocking
                        strictly necessary cookies will prevent you from logging in or using core features.
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-6">
                        <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</li>
                        <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies</li>
                        <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
                        <li><strong>Edge:</strong> Settings &gt; Privacy &gt; Cookies</li>
                    </ul>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">4.2 Cookie Consent Banner</h3>
                    <p className="mt-2 leading-relaxed">
                        When you first visit AlgoLove, you will see a cookie consent banner that allows you to
                        accept or reject non-essential cookies. You can change your preferences at any time by
                        clicking the cookie settings link in the footer.
                    </p>

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">4.3 Do Not Track</h3>
                    <p className="mt-2 leading-relaxed">
                        AlgoLove honors Do Not Track (DNT) browser signals. When DNT is enabled, we will not
                        load analytics or marketing cookies.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">5. Local Storage &amp; Session Storage</h2>
                    <p className="mt-3 leading-relaxed">
                        In addition to cookies, we use browser local storage and session storage for:
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-6">
                        <li><strong>Draft messages:</strong> Temporarily storing unsent message drafts so you don&apos;t lose them if you navigate away.</li>
                        <li><strong>Onboarding progress:</strong> Tracking which steps of the compatibility questionnaire you have completed.</li>
                        <li><strong>UI state:</strong> Remembering sidebar collapse state, filter selections, and other interface preferences.</li>
                    </ul>
                    <p className="mt-3 leading-relaxed">
                        Local storage data persists until cleared manually. Session storage data is automatically deleted
                        when you close the browser tab.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">6. Updates to This Policy</h2>
                    <p className="mt-3 leading-relaxed">
                        We may update this Cookies Policy as our practices or applicable regulations change. Material
                        changes will be communicated through our cookie consent banner or by email. The &quot;Last updated&quot;
                        date at the top of this page reflects the most recent revision.
                    </p>
                </section>

                <section>
                    <h2 className="font-heading text-2xl font-semibold text-slate-900">7. Contact</h2>
                    <p className="mt-3 leading-relaxed">
                        If you have questions about our use of cookies, contact:
                    </p>
                    <p className="mt-2 leading-relaxed">
                        <strong>AlgoLove Privacy Team</strong><br />
                        Email: <span className="font-medium text-slate-900">privacy@algolove.com</span>
                    </p>
                </section>
            </div>
        </div>
    )
}
