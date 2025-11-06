import { Container } from "@/components/site-layout/container";
import { Section } from "@/components/site-layout/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";

const faqs = [
  {
    question: "How does the QuickRite AI proposal generator work?",
    answer:
      "QuickRite's AI analyzes the job posting you provide, along with your profile information, portfolio, and testimonials. It then generates a personalized, compelling proposal tailored to the specific client's needs and requirements. You can review and edit the proposal before submitting it.",
  },
  {
    question: "Can I customize the AI-generated proposals?",
    answer:
      "Absolutely! QuickRite's AI generates a draft proposal that you can fully customize and edit. You can adjust the tone, add personal touches, or modify any section to better match your style. You can also create and save custom templates to speed up future proposals.",
  },
  {
    question: "What platforms does QuickRite work with?",
    answer:
      "QuickRite works with all major freelancing platforms including Upwork, Fiverr, Contra, Freelancer.com, and any other platform where you need to submit proposals. Simply copy your generated proposal and paste it into the platform of your choice.",
  },
  {
    question: "How do I track my proposal success rate?",
    answer:
      "Our built-in analytics dashboard allows you to track each proposal from submission to outcome. You can mark proposals as sent, viewed, or job awarded, and see detailed metrics on your win rates, response times, and which types of proposals perform best.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Yes, security and privacy are our top priorities. All your data is encrypted and stored securely. We never share your information with third parties, and you maintain full ownership of all your proposals, templates, and client data.",
  },
  {
    question: "Can I use my own templates?",
    answer:
      "Yes! You can create unlimited custom templates with or without AI assistance. Save your best-performing proposals as templates and reuse them for similar projects. QuickRite's AI can also help you create professional templates based on your niche and style.",
  },
  {
    question: "What if I'm not satisfied with the generated proposal?",
    answer:
      "You can regenerate proposals as many times as you need. Each generation considers your feedback and produces a new variation. You also have full editing control to refine any proposal to your exact specifications.",
  },
  {
    question: "Do I need technical skills to use QuickRite?",
    answer:
      "Not at all! QuickRite is designed to be user-friendly and intuitive. Simply paste the job posting, and QuickRite's AI handles the rest. No technical skills or AI knowledge required—just focus on winning more clients.",
  },
];

export const FAQSection = () => {
  return (
    <Section id="faq">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-md pb-6">
              Everything you need to know about QuickRite. Can't find the answer
              you're looking for? Reach out to our support team.
            </p>
            <Button asChild>
              <a href="mailto:support@aiproposals.com">Contact Support</a>
            </Button>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
};
