"use client";

import { Highlight } from "@tiptap/extension-highlight";
import { TaskList } from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Selection } from "@tiptap/extensions";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useImperativeHandle } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import { cn } from "@/lib/utils";
import { BlockquoteButton } from "./blockquote-button";
import { CodeBlockButton } from "./code-block-button";
import { ColorHighlightPopover } from "./color-highlight";
import { editorStyles } from "./extensions/editor-style";
import { CustomHeading } from "./extensions/heading-node";
import { HorizontalRule } from "./extensions/horizontal-rule-node";
import { CustomImageNode } from "./extensions/image";
import {
  ImageUploadNode,
  type ImageUploadNodeOptions,
} from "./extensions/image-upload";
import { CustomTaskItem } from "./extensions/task-item";
import { HeadingDropdownMenu } from "./heading-dropdown-menu";
import { ImageUploadButton } from "./image-upload-button";
import { LinkPopover } from "./link-popover";
import { ListDropdownMenu } from "./list-dropdown-menu";
import { MarkButton } from "./mark-button";
import { TextAlignButton } from "./text-align-button";
import { Toolbar, ToolbarSeparator, ToolbarToggleGroup } from "./toolbar";
import { UndoRedoButton } from "./undo-redo-button";

const EditorToolbar = () => {
  return (
    <Toolbar className="h-12 flex items-center md:justify-center overflow-x-auto border-0 border-input border-b">
      <ToolbarToggleGroup type="single">
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarToggleGroup>

      <ToolbarSeparator />

      <ToolbarToggleGroup type="multiple">
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarToggleGroup>

      <ToolbarSeparator />

      <ToolbarToggleGroup type="multiple">
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        <ColorHighlightPopover />
        <LinkPopover />
      </ToolbarToggleGroup>

      <ToolbarSeparator />

      <ToolbarToggleGroup type="multiple">
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarToggleGroup>

      <ToolbarSeparator />

      <ToolbarToggleGroup type="single">
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarToggleGroup>

      <ToolbarSeparator />

      <ToolbarToggleGroup type="multiple">
        <ImageUploadButton text="Add" />
      </ToolbarToggleGroup>
    </Toolbar>
  );
};

export function SimpleEditor({
  className,
  editorContentClassName,
  onChange,
  value,
  ref,
  error,
  imageUploadModes = ["url", "upload"],
  placeholder = "Start typing here...",
}: {
  className?: string;
  editorContentClassName?: string;
  onChange?: (content: string) => void;
  value?: string;
  error?: boolean;
  ref?: React.Ref<{ focus: () => void; blur: () => void }>;
  imageUploadModes?: ImageUploadNodeOptions["modes"];
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "focus:outline-none",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
          HTMLAttributes: { class: editorStyles.link },
        },
        paragraph: {
          HTMLAttributes: { class: editorStyles.paragraph },
        },
        blockquote: {
          HTMLAttributes: { class: editorStyles.blockquote },
        },
        code: {
          HTMLAttributes: { class: editorStyles.code },
        },
        codeBlock: {
          HTMLAttributes: { class: editorStyles.codeBlock },
        },
        orderedList: {
          HTMLAttributes: { class: editorStyles.list.ordered },
        },
        bulletList: {
          HTMLAttributes: { class: editorStyles.list.bullet },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CustomHeading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList.configure({
        HTMLAttributes: { class: editorStyles.taskList.list },
      }),
      CustomTaskItem.configure({
        nested: true,
        HTMLAttributes: { class: editorStyles.taskList.item },
      }),
      Highlight.configure({ multicolor: true }),
      CustomImageNode,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
        modes: imageUploadModes,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  useImperativeHandle(ref, () => ({
    //  mimick the onFocus and onBlur methods from react-hook-form
    focus: () => editor?.commands.focus(),
    blur: () => editor?.commands.blur(),
  }));

  return (
    <div
      className={cn(
        "group/input-group border-input dark:bg-input/30 relative flex flex-col-reverse md:flex-col w-full rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
        "h-[60lvh] min-w-0 overflow-y-auto",

        // Focus state.
        "has-[.ProseMirror-focused]:border-ring has-[.ProseMirror-focused]:ring-ring/50 has-[.ProseMirror-focused]:ring-[3px]",
        // Error state.
        "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
        className
      )}
    >
      <EditorContext.Provider value={{ editor }}>
        <EditorToolbar />
        <ScrollArea className="flex-1 overflow-y-auto [&>[data-radix-scroll-area-viewport]>div]:h-full">
          <EditorContent
            aria-invalid={error}
            className={cn("p-4 h-full [&>div]:h-full", editorContentClassName)}
            data-slot="main-editor"
            editor={editor}
            role="presentation"
          />
        </ScrollArea>
      </EditorContext.Provider>
    </div>
  );
}
