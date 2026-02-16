import { DarkCTA } from '@/components/landing/DarkCTA'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/landing/Hero'
import { Navbar } from '@/components/landing/Navbar'
import { SplitSection } from '@/components/landing/SplitSection'
import { TestimonialSection } from '@/components/landing/TestimonialSection'
import { TrustSection } from '@/components/landing/TrustSection'
import { WaitlistSection } from '@/components/landing/WaitlistSection'

export default function Home() {
    return (
        <div className="relative overflow-x-clip bg-[var(--background)]">
            <Navbar />
            <Hero />
            <TrustSection />
            <FeaturesGrid />
            <SplitSection />
            <TestimonialSection />
            <DarkCTA />
            <WaitlistSection />
            <Footer />
        </div>
    )
}
