import type { UseChatHelpers } from "@ai-sdk/react";
import { CopyCheckIcon, CopyIcon, PencilLineIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { useClipboard } from "@/hooks/use-clipboard";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MessageEditor } from "./message-editor";

const extractCopyableText = (text: string) => {
  const startMarker = "[COPYABLE_START]";
  const endMarker = "[COPYABLE_END]";

  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    return null;
  }

  // Extract text between markers and trim whitespace
  const copyableText = text
    .substring(startIndex + startMarker.length, endIndex)
    .trim();

  return copyableText;
};

export const RenderChatMessage = ({
  message,
  setMessages,
  regenerate,
  isReadonly,
}: {
  message: ChatMessage;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <div className="group/message">
      {message.parts.map((part, i) => {
        const showToolFeedback =
          part.type.startsWith("tool-") &&
          message.role === "assistant" &&
          i === message.parts.length - 1;

        switch (part.type) {
          case "text": {
            const showCopyAction =
              part.text.includes("[COPYABLE_START]") &&
              part.text.includes("[COPYABLE_END]");

            return mode === "view" ? (
              <Fragment key={`${message.id}-${i}`}>
                <Message from={message.role}>
                  <MessageContent>
                    <Response>
                      {part.text
                        .replace("[COPYABLE_START]", "")
                        .replace("[COPYABLE_END]", "")
                        .trim()}
                    </Response>
                  </MessageContent>
                </Message>
                <Actions
                  className={cn("justify-start", {
                    "-mt-2 justify-end": message.role === "user",
                  })}
                >
                  {message.role === "user" && !isReadonly && (
                    <Action
                      data-testid="message-edit-button"
                      onClick={() => setMode("edit")}
                      tooltip="Edit"
                    >
                      <PencilLineIcon />
                    </Action>
                  )}
                  {message.role === "assistant" && showCopyAction && (
                    <CopyAction text={extractCopyableText(part.text) ?? ""} />
                  )}
                </Actions>
              </Fragment>
            ) : (
              <MessageEditor
                key={`${message.id}-${i}`}
                message={message}
                regenerate={regenerate}
                setMessages={setMessages}
                setMode={setMode}
              />
            );
          }
          case "tool-getTemplates":
            return showToolFeedback ? (
              <ToolCallFeedback
                key={`${message.id}-${i}`}
                text="[Fetching templates...]"
              />
            ) : null;
          case "tool-getProjectsAndCaseStudies":
            return showToolFeedback ? (
              <ToolCallFeedback
                key={`${message.id}-${i}`}
                text="[Fetching projects and case studies...]"
              />
            ) : null;
          case "tool-saveProposal":
            return showToolFeedback ? (
              <ToolCallFeedback
                key={`${message.id}-${i}`}
                text="[Saving proposal...]"
              />
            ) : null;
          case "tool-createTemplateFromProposal":
            return showToolFeedback ? (
              <ToolCallFeedback
                key={`${message.id}-${i}`}
                text="[Creating template...]"
              />
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
};

const CopyAction = ({ text }: { text: string }) => {
  const clipboard = useClipboard();

  return (
    <Action label="Copy" onClick={() => clipboard.copy(text)} tooltip="Copy">
      {clipboard.copied ? (
        <CopyCheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Action>
  );
};

const ToolCallFeedback = ({ text }: { text: string }) => (
  <i className="flex text-muted-foreground text-sm">{text}</i>
);
