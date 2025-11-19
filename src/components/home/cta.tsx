import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";
import { Button } from "../ui/button";

export const CTASection = () => {
  return (
    <Section className="relative overflow-x-clip" id="cta">
      {/* Background gradient orbs */}
      <div className="-z-10 absolute inset-0">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl" />
      </div>

      <Container
        className="relative rounded-3xl border bg-card/50 p-8 text-center backdrop-blur-sm md:p-12 lg:p-16"
        size="md"
      >
        {/* Subtle gradient overlay */}
        <div className="-z-10 absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

        <div className="group relative mb-6 inline-block">
          <span className="relative z-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-semibold text-primary text-sm">
            <Sparkles className="size-4" />
            Start Your Free Trial
          </span>
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <h2 className="mb-6 font-bold text-3xl md:text-4xl lg:text-5xl">
          Ready to Win More Clients?
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground md:text-lg">
          Join thousands of freelancers who are landing more projects with
          AI-powered proposals. Start creating winning proposals today—no credit
          card required.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild className="w-full sm:w-auto" size="lg">
            <Link href="/auth/signup">Get Started for Free</Link>
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto"
            size="lg"
            variant="outline"
          >
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>

        <p className="mt-6 text-muted-foreground text-xs md:text-sm">
          No credit card required • Free forever plan • Cancel anytime
        </p>
      </Container>
    </Section>
  );
};
