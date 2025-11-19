import { Check, X } from "lucide-react";
import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";

const problems = [
  "Wasting valuable time drafting proposals",
  "Struggling to stand out from the competition",
  "Delivering proposals with inconsistent quality",
  "Lacking insights on what proposals work",
];

const solutions = [
  "Generate tailored proposals in under 2 minutes",
  "Stand out with high-impact, unique proposals",
  "Include social proof and relevant case studies",
  "Get data-driven insights to optimize proposals",
];

const stats = [
  { value: "10x", label: "Faster Proposals" },
  { value: "3x", label: "More Submissions" },
  { value: "2x", label: "Higher Win Rate" },
  { value: "100%", label: "Professional Quality" },
];

export const BenefitsSection = () => {
  return (
    <Section className="relative w-full overflow-x-clip" id="benefits">
      {/* Background gradient */}
      <div className="-z-10 absolute inset-0">
        <div className="-right-40 absolute top-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Container size="md">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-3xl md:text-4xl lg:text-5xl">
            Stop Losing Clients to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Slow Proposals
            </span>
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground text-sm md:text-lg">
            Writing quality proposals can be time-consuming and difficult.
            Competitors move fast. Time to level up.
          </p>
        </div>

        <div className="mx-auto grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Problems - Old Way */}
          <div className="relative">
            <div className="mb-6">
              <span className="inline-block rounded-full border border-border bg-muted px-3 py-1 font-semibold text-muted-foreground text-xs">
                The Old Way
              </span>
            </div>
            <h3 className="mb-6 font-bold text-2xl text-muted-foreground md:text-3xl">
              Without QuickRite
            </h3>
            <div className="space-y-4">
              {problems.map((problem) => (
                <div
                  className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4"
                  key={problem}
                >
                  <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    <X
                      className="size-4 text-muted-foreground"
                      strokeWidth={3}
                    />
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {problem}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions - New Way */}
          <div className="relative">
            <div className="mb-6">
              <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-semibold text-primary text-xs">
                The New Way
              </span>
            </div>
            <h3 className="mb-6 font-bold text-2xl md:text-3xl">
              With QuickRite
            </h3>
            <div className="space-y-4">
              {solutions.map((solution) => (
                <div
                  className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
                  key={solution}
                >
                  <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Check className="size-4 text-primary" strokeWidth={3} />
                  </div>
                  <p className="font-medium text-sm md:text-base">{solution}</p>
                </div>
              ))}
            </div>

            {/* Glow effect */}
            <div className="-inset-4 -z-10 absolute rounded-3xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-50 blur-2xl" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div
              className="rounded-2xl border bg-accent/50 p-6 text-center"
              key={stat.label}
            >
              <div className="bg-linear-to-r from-primary to-foreground bg-clip-text font-bold text-3xl text-foreground drop-shadow-[2px_1px_24px_var(--foreground)] transition-all duration-300 md:text-4xl">
                {stat.value}
              </div>
              <p className="pt-2 text-muted-foreground text-xs md:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
