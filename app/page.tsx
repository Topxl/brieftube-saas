import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <div className="section-divider" />
      <Problem />
      <HowItWorks />
      <div className="section-divider" />
      <Features />
      <Pricing />
      <div className="section-divider" />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
