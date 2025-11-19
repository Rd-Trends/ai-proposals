"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ChatHeader } from "@/components/chats/chat-header";
import { ChatInput } from "@/components/chats/chat-input";
import type { Conversation as TConversation } from "@/lib/db/schema/conversations";
import type { Tone } from "@/lib/db/schema/templates";
import { ChatSDKError } from "@/lib/error";
import { queryKeys } from "@/lib/query-keys";
import type { ChatMessage } from "@/lib/types";
import { fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import type { PromptInputMessage } from "../ai-elements/prompt-input";
import { ChatMessages } from "./chat-messages";

export function Chat({
  id,
  initialMessages,
  conversation,
  isReadonly,
}: {
  id: string;
  initialMessages?: ChatMessage[];
  conversation?: TConversation | null;
  isReadonly: boolean;
}) {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
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
            tone,
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
      // Focus back to the text area after message is sent
      textAreaRef.current?.focus();
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
    setText(prompt);
    textAreaRef.current?.focus();
  };

  const handleSubmit = (message: PromptInputMessage) => {
    console.log("Submitting message:", message);
    if (!(message.text || message.files?.length)) {
      return;
    }

    sendMessage({
      text: message.text || "Sent with attachments",
      files: message.files,
    });
    setText("");
  };

  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader
        conversation={conversation}
        conversationId={id}
        isReadonly={isReadonly}
      />

      <ChatMessages
        isReadonly={isReadonly}
        messages={messages}
        onPromptSelect={handleQuickPrompt}
        regenerate={regenerate}
        setMessages={setMessages}
        status={status}
      />

      {!isReadonly && (
        <ChatInput
          handleSubmit={handleSubmit}
          ref={textAreaRef}
          setText={setText}
          setTone={setTone}
          status={status}
          text={text}
          tone={tone}
        />
      )}
    </div>
  );
}
