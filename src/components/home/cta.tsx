import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";
import { Button } from "../ui/button";

export const CTASection = () => {
  return (
    <Section id="cta" className="relative overflow-x-clip">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
      </div>

      <Container
        size="md"
        className="text-center p-8 md:p-12 lg:p-16 rounded-3xl border bg-card/50 backdrop-blur-sm relative"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10" />

        <div className="inline-block mb-6 relative group">
          <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 relative z-10 inline-flex items-center gap-2">
            <Sparkles className="size-4" />
            Start Your Free Trial
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 blur-sm opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Ready to Win More Clients?
        </h2>

        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of freelancers who are landing more projects with
          AI-powered proposals. Start creating winning proposals today—no credit
          card required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="w-full sm:w-auto">
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground mt-6">
          No credit card required • Free forever plan • Cancel anytime
        </p>
      </Container>
    </Section>
  );
};
