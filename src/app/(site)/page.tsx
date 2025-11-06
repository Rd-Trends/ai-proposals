import type { Metadata } from "next";
import { BenefitsSection } from "@/components/home/benefits";
import { CTASection } from "@/components/home/cta";
import { FAQSection } from "@/components/home/faq";
import { FeaturesSection } from "@/components/home/features";
import { HeroSection } from "@/components/home/hero";
import { HowItWorksSection } from "@/components/home/how-it-works";

export const metadata: Metadata = {
  title: "QuickRite — Write Winning Freelance Proposals Faster",
  description:
    "Generate tailored proposals for Upwork, Contra, and Fiverr with QuickRite. Build templates, track performance, and manage your profile to win more freelance jobs.",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
