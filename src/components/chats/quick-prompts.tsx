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

interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
}

export const QuickPrompts = ({ onPromptSelect }: QuickPromptsProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="text-center mb-8 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">
          How can I help you create winning proposals?
        </h2>
        <p className="text-muted-foreground mb-8">
          I can help you analyze job postings, create proposal structures,
          improve existing proposals, and develop pricing strategies.
        </p>
      </div>

      {/* Quick Start Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {quickPromptsData.map((prompt) => (
          <Card
            key={prompt.id}
            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
            onClick={() => onPromptSelect(prompt.prompt)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <prompt.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">{prompt.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
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
