import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";
import { Button } from "../ui/button";

export const HeroSection = () => {
  return (
    <Section
      className="relative h-[720px] max-h-[calc(100lvh-var(--header-height))] w-full overflow-x-clip"
      id="hero"
      paddingY="none"
    >
      {/* Background gradient orbs - positioned at edges */}
      <div className="-z-10 absolute inset-0">
        <div className="-top-40 -left-40 absolute h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="-top-20 -right-40 absolute h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="-bottom-40 -translate-x-1/2 absolute left-1/2 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <Container className="flex h-full flex-col items-center justify-center">
        {/* Badge with glow */}
        <div className="group relative mb-6 inline-block">
          <span className="relative z-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-semibold text-primary text-sm">
            <Sparkles className="size-4" />
            AI-Powered Platform
          </span>
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <h1 className="relative mb-4 max-w-6xl text-center font-bold text-3xl md:text-5xl xl:text-7xl">
          Stop Sending Generic Proposals. Start{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Landing Interviews.
            </span>
          </span>
        </h1>

        <p className="mb-8 max-w-2xl text-center text-base text-muted-foreground md:text-lg">
          QuickRite uses AI to craft personalized proposals that reflect your
          experience and grab clients' attention—so you can spend less time
          writing and more time landing interviews.
        </p>

        <Button asChild className="shadow-lg" size="lg">
          <Link href="/auth/signup">Get Started for Free</Link>
        </Button>
      </Container>
    </Section>
  );
};
