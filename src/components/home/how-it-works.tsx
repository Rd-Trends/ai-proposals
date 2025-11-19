import { FileText, Send, Sparkles, TrendingUp } from "lucide-react";
import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Create Your Profile",
    description:
      "Set up your professional profile with your skills, experience, and portfolio. Add testimonials to build credibility.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Generate AI Proposals",
    description:
      "Paste the job posting and let our AI create a personalized, compelling proposal tailored to the client's needs.",
  },
  {
    icon: Send,
    step: "03",
    title: "Customize & Send",
    description:
      "Review, edit, and fine-tune your proposal. Copy it directly to your favorite freelancing platform.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Track & Improve",
    description:
      "Monitor which proposals win clients and use analytics to continuously improve your success rate.",
  },
];

export const HowItWorksSection = () => {
  return (
    <Section className="relative w-full overflow-x-hidden" id="how-it-works">
      {/* Background gradient orbs */}
      <div className="-z-10 absolute inset-0">
        <div className="-left-20 absolute top-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="-right-20 absolute bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Container>
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="group relative mb-4 inline-block">
            <span className="relative z-10 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-semibold text-primary text-sm">
              Simple Process
            </span>
            {/* Animated glow border */}
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <h2 className="mb-4 font-bold text-3xl md:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="max-w-md text-center text-muted-foreground text-sm md:text-lg">
            From setup to success in four simple steps. Start winning more
            clients today.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => {
            return (
              <article className="group relative" key={step.title}>
                {/* Card */}
                <div className="relative h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-accent/50 hover:shadow-lg">
                  {/* Step number with gradient */}
                  <div className="mb-6 flex items-start justify-between">
                    <div className="relative flex size-12 items-center justify-center rounded-lg bg-accent shadow-lg">
                      <step.icon className="size-5.5" strokeWidth={2.5} />
                      {/* Glow effect */}
                      <div className="-z-10 absolute inset-0 rounded-xl bg-primary opacity-50 blur-xl" />
                    </div>
                    <span className="font-bold text-4xl text-muted-foreground/20">
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 font-semibold text-lg md:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Animated gradient border on hover */}
                  <div className="-z-10 absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 transition-all duration-300 group-hover:from-primary/10 group-hover:via-transparent group-hover:to-primary/10" />
                </div>

                {/* Connector arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="-right-4 absolute top-14 z-10 hidden items-center justify-center lg:flex">
                    <div className="h-[2px] w-8 bg-gradient-to-r from-primary/60 to-primary/20" />
                    <div className="h-0 w-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-primary/20" />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};
