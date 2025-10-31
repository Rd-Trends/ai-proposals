import type { ChatStatus } from "ai";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";

interface ChatInputProps {
  input: string;
  status: ChatStatus;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({
  input,
  status,
  onInputChange,
  onSubmit,
}: ChatInputProps) => {
  return (
    <div className="w-full shrink-0 px-4 pb-4 bg-background border-t sticky bottom-0">
      <div className="max-w-3xl mx-auto w-full">
        <PromptInput onSubmit={onSubmit} className="relative">
          <PromptInputTextarea
            onChange={(e) => onInputChange(e.target.value)}
            value={input}
            placeholder="Ask me anything about creating proposals..."
            className="pr-10"
          />
          <PromptInputToolbar>
            <PromptInputSubmit
              className="absolute right-1 bottom-1"
              disabled={!input.trim()}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
        <p className="text-xs text-muted-foreground text-center py-2">
          AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};
