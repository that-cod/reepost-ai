import NewHeader from "@/components/landing/NewHeader";
import NewHero from "@/components/landing/NewHero";
import NewWhySection from "@/components/landing/NewWhySection";
import NewFeatures from "@/components/landing/NewFeatures";
import NewTestimonials from "@/components/landing/NewTestimonials";
import NewFAQ from "@/components/landing/NewFAQ";
import NewFooter from "@/components/landing/NewFooter";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-white">
      <NewHeader />
      <NewHero />
      <NewWhySection />
      <NewFeatures />
      <NewTestimonials />
      <NewFAQ />
      <NewFooter />
    </main>
  );
}
