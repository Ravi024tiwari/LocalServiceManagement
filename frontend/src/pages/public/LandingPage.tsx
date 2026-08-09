import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { HeroSection } from "../../components/landing/HeroSection";
import { PopularServices } from "../../components/landing/PopularServices";
import { HowItWorks } from "../../components/landing/HowItWorks";
import { WhyChooseUs } from "../../components/landing/WhyChooseUs";
import { PromoBanner } from "../../components/landing/PromoBanner";
import { StatsSection } from "../../components/landing/StatsSection";
import { TestimonialsSection } from "../../components/landing/TestimonialsSection";
import { NewsletterSection } from "../../components/landing/NewsletterSection";
import { LandingFooter } from "../../components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Responsive Navbar */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <HeroSection />
        <PopularServices />
        <HowItWorks />
        <WhyChooseUs />
        <PromoBanner />
        <StatsSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>

      {/* Footer */}
      <LandingFooter />

    </div>
  );
}
