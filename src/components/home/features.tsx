import {
  Award,
  BarChart3,
  Briefcase,
  FileText,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Generate personalized, winning proposals in seconds using advanced AI technology",
  },
  {
    icon: FileText,
    title: "Custom Templates",
    description:
      "Create and save reusable templates tailored to your niche and style",
  },
  {
    icon: Award,
    title: "Testimonials Integration",
    description:
      "Automatically include your best client testimonials in proposals to build instant credibility",
  },
  {
    icon: Briefcase,
    title: "Portfolio Showcase",
    description:
      "Add relevant projects and case studies to demonstrate your expertise and past successes",
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description:
      "Monitor proposal success rates and optimize your approach with detailed analytics",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Save hours of work with instant proposal generation and smart suggestions",
  },
  {
    icon: Users,
    title: "Multi-Platform Support",
    description:
      "Works seamlessly with Upwork, Fiverr, Contra, and other freelancing platforms",
  },
  {
    icon: Target,
    title: "Higher Win Rates",
    description:
      "Craft compelling proposals that stand out and win more clients consistently",
  },
];

export const FeaturesSection = () => {
  return (
    <Section id="features">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto">
            All the tools you need to create winning proposals and grow your
            freelancing business
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10 md:gap-x-10 xl:gap-x-16">
          {features.map((feature) => {
            return (
              <article key={feature.title} className="flex flex-col gap-3">
                <div className="size-10 rounded-md bg-primary flex items-center justify-center">
                  <feature.icon className="size-4.5 text-primary-foreground" />
                </div>
                <h3 className="text-sm md:text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};
