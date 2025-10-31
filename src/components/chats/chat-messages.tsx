"use client";

import type { ChatStatus, UIMessage } from "ai";
import { CopyCheck, CopyIcon } from "lucide-react";
import { Fragment } from "react";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { QuickPrompts } from "@/components/chats/quick-prompts";
import { useClipboard } from "@/hooks/use-clipboard";

const extractProposal = (text: string) => {
  const startMarker = "[PROPOSAL_START]";
  const endMarker = "[PROPOSAL_END]";

  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    return null;
  }

  // Extract text between markers and trim whitespace
  const proposalText = text
    .substring(startIndex + startMarker.length, endIndex)
    .trim();

  return proposalText;
};

export const ChatMessages = ({
  messages,
  status,
  onPromptSelect,
}: {
  messages: Array<UIMessage>;
  status: ChatStatus;
  onPromptSelect: (prompt: string) => void;
}) => {
  return (
    <Conversation className="flex flex-col gap-4 md:gap-6">
      {messages.length === 0 ? (
        <QuickPrompts onPromptSelect={onPromptSelect} />
      ) : (
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.map((message) => (
            <Fragment key={message.id}>
              {message.parts.map((part, i) => {
                const showToolFeedback =
                  part.type.startsWith("tool-") &&
                  message.role === "assistant" &&
                  i === message.parts.length - 1;

                switch (part.type) {
                  case "text": {
                    const showCopyProposalAction =
                      part.text.includes("[PROPOSAL_START]") &&
                      part.text.includes("[PROPOSAL_END]");

                    return (
                      <Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          <MessageContent>
                            <Response>
                              {part.text
                                .replace("[PROPOSAL_START]", "")
                                .replace("[PROPOSAL_END]", "")
                                .trim()}
                            </Response>
                          </MessageContent>
                        </Message>
                        {message.role === "assistant" &&
                          showCopyProposalAction && (
                            <Actions className="justify-end max-w-[85%] md:max-w-[80%] -mt-2">
                              <CopyToClipboardAction
                                text={extractProposal(part.text) || ""}
                              />
                            </Actions>
                          )}
                      </Fragment>
                    );
                  }
                  case "tool-getTemplates":
                    return showToolFeedback ? (
                      <ToolCallFeedback
                        text="[Fetching templates...]"
                        key={`${message.id}-${i}`}
                      />
                    ) : null;
                  case "tool-getProjectsAndCaseStudies":
                    return showToolFeedback ? (
                      <ToolCallFeedback
                        text="[Fetching projects and case studies...]"
                        key={`${message.id}-${i}`}
                      />
                    ) : null;
                  case "tool-saveProposal":
                    return showToolFeedback ? (
                      <ToolCallFeedback
                        text="[Saving proposal...]"
                        key={`${message.id}-${i}`}
                      />
                    ) : null;
                  case "tool-createTemplateFromProposal":
                    return showToolFeedback ? (
                      <ToolCallFeedback
                        text="[Creating template...]"
                        key={`${message.id}-${i}`}
                      />
                    ) : null;
                  default:
                    return null;
                }
              })}
            </Fragment>
          ))}

          {status === "submitted" && <Loader />}
        </ConversationContent>
      )}

      <ConversationScrollButton />
    </Conversation>
  );
};

const CopyToClipboardAction = ({ text }: { text: string }) => {
  const clipboard = useClipboard();

  return (
    <Action onClick={() => clipboard.copy(text)} label="Copy">
      {clipboard.copied ? (
        <CopyCheck className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Action>
  );
};

const ToolCallFeedback = ({ text }: { text: string }) => {
  return <i className="flex text-sm text-muted-foreground">{text}</i>;
};
