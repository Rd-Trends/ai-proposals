"use client";

import { useChat } from "@ai-sdk/react";
import { FileText, Lightbulb, PencilLine, Target } from "lucide-react";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { Card } from "@/components/ui/card";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center overflow-hidden">
      <div className="w-full flex-1 flex flex-col items-center overflow-y-auto">
        {messages.length === 0 ? (
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
              {quickPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <prompt.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">
                        {prompt.title}
                      </h3>
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
        ) : (
          <Conversation className="flex-1 w-full max-w-full">
            <ConversationContent className="px-0 py-6 max-w-3xl mx-auto">
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text": // we don't use any reasoning or tool calls in this example
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))}
              {status === "submitted" && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}
      </div>

      <div className="w-full flex flex-col items-center shrink-0">
        <PromptInput onSubmit={handleSubmit} className="relative max-w-3xl">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
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
}

const quickPrompts = [
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
