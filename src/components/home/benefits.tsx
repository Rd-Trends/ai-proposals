import { Check, X } from "lucide-react";
import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";

const problems = [
  "Spending hours writing custom proposals",
  "Struggling to stand out from competitors",
  "Missing deadlines due to proposal backlogs",
  "Inconsistent proposal quality",
];

const solutions = [
  "Generate proposals in under 2 minutes",
  "AI-crafted personalized proposals that win",
  "Submit more proposals, win more clients",
  "Professional quality, every single time",
];

const stats = [
  { value: "10x", label: "Faster Proposals" },
  { value: "3x", label: "More Submissions" },
  { value: "2x", label: "Higher Win Rate" },
  { value: "100%", label: "Professional Quality" },
];

export const BenefitsSection = () => {
  return (
    <Section id="benefits" className="w-full overflow-x-clip relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <Container size="md">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Stop Losing Clients to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Slow Proposals
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            While you're spending hours crafting the perfect proposal, your
            competitors are already submitting theirs. Time to level up.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mx-auto">
          {/* Problems - Old Way */}
          <div className="relative">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground border border-border">
                The Old Way
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-muted-foreground">
              Without AI Proposals
            </h3>
            <div className="space-y-4">
              {problems.map((problem) => (
                <div
                  key={problem}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="size-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X
                      className="size-4 text-muted-foreground"
                      strokeWidth={3}
                    />
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {problem}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions - New Way */}
          <div className="relative">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                The New Way
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              With AI Proposals
            </h3>
            <div className="space-y-4">
              {solutions.map((solution) => (
                <div
                  key={solution}
                  className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                >
                  <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="size-4 text-primary" strokeWidth={3} />
                  </div>
                  <p className="text-sm md:text-base font-medium">{solution}</p>
                </div>
              ))}
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl blur-2xl -z-10 opacity-50" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-accent/50 border"
            >
              <div className="from-primary to-foreground bg-linear-to-r bg-clip-text text-3xl md:text-4xl font-bold text-foreground drop-shadow-[2px_1px_24px_var(--foreground)] transition-all duration-300">
                {stat.value}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground pt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
