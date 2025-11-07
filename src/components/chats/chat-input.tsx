"use client";
import type { ChatStatus } from "ai";
import {
  PromptInput,
  // PromptInputActionAddAttachments,
  // PromptInputActionMenu,
  // PromptInputActionMenuContent,
  // PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  // PromptInputButton,
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
import { PROPOSAL_TONE, type Tone } from "@/lib/db";

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
    <div className="w-full shrink-0 px-4 pb-4 bg-background border-t sticky bottom-0">
      <PromptInput
        onSubmit={handleSubmit}
        className="w-full max-w-3xl mx-auto"
        globalDrop
        multiple
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            ref={ref}
            value={text}
            placeholder="Ask me anything about creating proposals..."
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
                {PROPOSAL_TONE.map((tone) => (
                  <PromptInputSelectItem
                    key={tone}
                    value={tone}
                    className="capitalize"
                  >
                    {tone}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!text && !status} status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};

// import type { ChatStatus } from "ai";
// import {
//   PromptInput,
//   PromptInputSubmit,
//   PromptInputTextarea,
//   PromptInputToolbar,
// } from "@/components/ai-elements/prompt-input";

// interface ChatInputProps {
//   input: string;
//   status: ChatStatus;
//   onInputChange: (value: string) => void;
//   onSubmit: (e: React.FormEvent) => void;
// }

// export const ChatInput = ({
//   input,
//   status,
//   onInputChange,
//   onSubmit,
// }: ChatInputProps) => {
//   return (
//     <div className="w-full shrink-0 px-4 pb-4 bg-background border-t sticky bottom-0">
//       <div className="max-w-3xl mx-auto w-full">
//         <PromptInput onSubmit={onSubmit} className="relative">
//           <PromptInputTextarea
//             onChange={(e) => onInputChange(e.target.value)}
//             value={input}
//             placeholder="Ask me anything about creating proposals..."
//             className="pr-10"
//           />
//           <PromptInputToolbar>
//             <PromptInputSubmit
//               className="absolute right-1 bottom-1"
//               disabled={!input.trim()}
//               status={status}
//             />
//           </PromptInputToolbar>
//         </PromptInput>
//         <p className="text-xs text-muted-foreground text-center py-2">
//           AI can make mistakes. Please verify important information.
//         </p>
//       </div>
//     </div>
//   );
// };
