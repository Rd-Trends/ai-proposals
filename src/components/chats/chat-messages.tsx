"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatStatus } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { QuickPrompts } from "@/components/chats/quick-prompts";
import type { ChatMessage } from "@/lib/types";
import { RenderChatMessage } from "./message";

export const ChatMessages = ({
  messages,
  status,
  onPromptSelect,
  setMessages,
  regenerate,
  isReadonly,
}: {
  messages: ChatMessage[];
  status: ChatStatus;
  onPromptSelect: (prompt: string) => void;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
}) => (
  <Conversation className="flex flex-col gap-4 md:gap-6">
    {messages.length === 0 ? (
      <QuickPrompts onPromptSelect={onPromptSelect} />
    ) : (
      <ConversationContent className="mx-auto w-full max-w-3xl">
        {messages.map((message) => (
          <RenderChatMessage
            isReadonly={isReadonly}
            key={message.id}
            message={message}
            regenerate={regenerate}
            setMessages={setMessages}
          />
        ))}

        {status === "submitted" && <Loader />}
      </ConversationContent>
    )}

    <ConversationScrollButton shouldAutoScroll={status === "submitted"} />
  </Conversation>
);
