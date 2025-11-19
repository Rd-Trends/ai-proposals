import { FileText, Lightbulb, PencilLine, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

export const quickPromptsData = [
  {
    id: 1,
    icon: PencilLine,
    title: "Write a Proposal",
    prompt:
      "Help me write a proposal for this job posting: [paste job posting here]",
  },
  {
    id: 2,
    icon: FileText,
    title: "Analyze Job Posting",
    prompt:
      "Help me analyze this job posting and understand what the client is really looking for: [paste job posting here]",
  },
  {
    id: 3,
    icon: Target,
    title: "Create Proposal Structure",
    prompt:
      "Create a structured proposal outline for a [type of project] project with [budget range] budget",
  },
  {
    id: 4,
    icon: Lightbulb,
    title: "Improve My Proposal",
    prompt:
      "Review and improve my proposal draft. Here's what I have so far: [paste proposal here]",
  },
];

type QuickPromptsProps = {
  onPromptSelect: (prompt: string) => void;
};

export const QuickPrompts = ({ onPromptSelect }: QuickPromptsProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="mb-8 max-w-2xl text-center">
        <h2 className="mb-4 font-semibold text-2xl">
          How can I help you create winning proposals?
        </h2>
        <p className="mb-8 text-muted-foreground">
          I can help you analyze job postings, create proposal structures,
          improve existing proposals, and develop pricing strategies.
        </p>
      </div>

      {/* Quick Start Prompts */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {quickPromptsData.map((prompt) => (
          <Card
            className="cursor-pointer border-border/50 p-4 transition-colors hover:bg-accent/50"
            key={prompt.id}
            onClick={() => onPromptSelect(prompt.prompt)}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <prompt.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-medium text-sm">{prompt.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {prompt.prompt.length > 80
                    ? `${prompt.prompt.substring(0, 80)}...`
                    : prompt.prompt}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
