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

export const FeaturesSection = () => (
  <Section id="features">
    <Container>
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-bold text-3xl md:text-4xl lg:text-5xl">
          Everything you need.
          <br />
          Nothing you don&apos;t.
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground text-sm md:text-lg">
          All the tools you need to create winning proposals and grow your
          freelancing business
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 gap-y-10 md:grid-cols-3 md:gap-x-10 xl:grid-cols-4 xl:gap-x-16">
        {features.map((feature) => (
          <article className="flex flex-col gap-3" key={feature.title}>
            <div className="flex size-10 items-center justify-center rounded-md bg-primary">
              <feature.icon className="size-4.5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-sm md:text-base">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed md:text-sm">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </Container>
  </Section>
);
