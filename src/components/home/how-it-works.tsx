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
    <Section id="how-it-works" className="w-full relative overflow-x-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <Container>
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-block mb-4 relative group">
            <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 relative z-10">
              Simple Process
            </span>
            {/* Animated glow border */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 blur-sm opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md text-center">
            From setup to success in four simple steps. Start winning more
            clients today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            return (
              <article key={step.title} className="relative group">
                {/* Card */}
                <div className="relative h-full p-6 rounded-2xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  {/* Step number with gradient */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative size-12 rounded-lg bg-accent flex items-center justify-center shadow-lg">
                      <step.icon className="size-5.5" strokeWidth={2.5} />
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-primary blur-xl opacity-50 -z-10" />
                    </div>
                    <span className="text-4xl font-bold text-muted-foreground/20">
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg md:text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-transparent group-hover:to-primary/10 transition-all duration-300 -z-10" />
                </div>

                {/* Connector arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-14 -right-4 z-10 items-center justify-center">
                    <div className="w-8 h-[2px] bg-gradient-to-r from-primary/60 to-primary/20" />
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-primary/20" />
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
