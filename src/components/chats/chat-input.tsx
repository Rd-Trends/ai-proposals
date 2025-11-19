"use client";

import type { ChatStatus } from "ai";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { PROPOSAL_TONE, type Tone } from "@/lib/db/schema/templates";

type ChatInputProps = {
  handleSubmit: (message: PromptInputMessage) => void;
  setText: (text: string) => void;
  text: string;
  ref: React.RefObject<HTMLTextAreaElement | null>;
  status: ChatStatus;
  tone?: Tone;
  setTone?: React.Dispatch<React.SetStateAction<Tone>>;
};

export const ChatInput = ({
  handleSubmit,
  setText,
  text,
  status,
  ref,
  tone,
  setTone,
}: ChatInputProps) => {
  return (
    <div className="sticky bottom-0 w-full shrink-0 border-t bg-background px-4 pb-4">
      <PromptInput
        className="mx-auto w-full max-w-3xl"
        globalDrop
        multiple
        onSubmit={handleSubmit}
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask me anything about creating proposals..."
            ref={ref}
            value={text}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            {/* <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu> */}
            <PromptInputSpeechButton
              onTranscriptionChange={setText}
              textareaRef={ref}
            />
            {/* <PromptInputButton
            onClick={() => setUseWebSearch(!useWebSearch)}
            variant={useWebSearch ? "default" : "ghost"}
          >
            <GlobeIcon size={16} />
            <span>Search</span>
          </PromptInputButton> */}
            <PromptInputSelect
              onValueChange={(value) => {
                setTone?.(value as Tone);
              }}
              value={tone}
            >
              <PromptInputSelectTrigger>
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {PROPOSAL_TONE.map((proposalTone) => (
                  <PromptInputSelectItem
                    className="capitalize"
                    key={proposalTone}
                    value={proposalTone}
                  >
                    {proposalTone}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!(text || status)} status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};
