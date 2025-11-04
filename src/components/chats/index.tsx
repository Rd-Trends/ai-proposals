"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { toast } from "sonner";
import { ChatHeader } from "@/components/chats/chat-header";
import { ChatInput } from "@/components/chats/chat-input";
import type { Conversation as TConversation } from "@/lib/db";
import { ChatSDKError } from "@/lib/error";
import { queryKeys } from "@/lib/query-keys";
import type { ChatMessage } from "@/lib/types";
import { fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { ChatMessages } from "./chat-messages";

export function Chat({
  id,
  initialMessages,
  conversation,
}: {
  id: string;
  initialMessages?: ChatMessage[];
  conversation?: TConversation | null;
}) {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
  const { sendMessage, messages, status, setMessages, regenerate } = useChat({
    id, // use the provided chat ID
    messages: initialMessages, // load initial messages
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            ...request.body,
          },
        };
      },
    }),
    // onData: (dataPart) => {
    //   setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    //   if (dataPart.type === "data-usage") {
    //     setUsage(dataPart.data);
    //   }
    // },
    onFinish: () => {
      // Invalidate conversations query keys to refresh conversation list
      if (messages.length < 3) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.all,
        });
      }
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        // Check if it's a credit card error
        if (
          error.message?.includes("AI Gateway requires a valid credit card")
        ) {
          // setShowCreditCardAlert(true);
        } else {
          toast.error(error.message);
        }
      }
    },
  });

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
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader conversationId={id} conversation={conversation} />

      <ChatMessages
        messages={messages}
        status={status}
        onPromptSelect={handleQuickPrompt}
        setMessages={setMessages}
        regenerate={regenerate}
      />

      <ChatInput
        input={input}
        status={status}
        onInputChange={setInput}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
