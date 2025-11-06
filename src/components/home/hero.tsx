import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";
import { Button } from "../ui/button";

export const HeroSection = () => {
  return (
    <Section
      id="hero"
      paddingY="none"
      className="w-full overflow-x-clip h-[720px] max-h-[calc(100lvh-var(--header-height))] relative"
    >
      {/* Background gradient orbs - positioned at edges */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
      </div>

      <Container className="h-full flex flex-col items-center justify-center">
        {/* Badge with glow */}
        <div className="inline-block mb-6 relative group">
          <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 relative z-10 inline-flex items-center gap-2">
            <Sparkles className="size-4" />
            AI-Powered Platform
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 blur-sm opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
        </div>

        <h1 className="text-3xl md:text-5xl xl:text-7xl font-bold text-center mb-4 max-w-6xl relative">
          Stop Sending Generic Proposals. Start{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Landing Interviews.
            </span>
          </span>
        </h1>

        <p className="text-base md:text-lg text-center text-muted-foreground max-w-2xl mb-8">
          QuickRite uses AI to craft personalized proposals that reflect your
          experience and grab clients' attention—so you can spend less time
          writing and more time landing interviews.
        </p>

        <Button size="lg" className="shadow-lg" asChild>
          <Link href="/auth/signup">Get Started for Free</Link>
        </Button>
      </Container>
    </Section>
  );
};
