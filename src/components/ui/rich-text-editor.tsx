"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Unlink,
} from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Separator } from "./separator";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href;
    // biome-ignore lint/suspicious/noAlert: get url via prompt
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 border-border border-b p-2">
      <Button
        className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-muted")}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        onClick={() => editor.chain().focus().toggleBold().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-muted")}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        className={cn("h-8 w-8 p-0", editor.isActive("strike") && "bg-muted")}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        className={cn("h-8 w-8 p-0", editor.isActive("code") && "bg-muted")}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        onClick={() => editor.chain().focus().toggleCode().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator className="mx-1 h-8" orientation="vertical" />

      <Button
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("heading", { level: 2 }) && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("bulletList") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("orderedList") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("blockquote") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator className="mx-1 h-8" orientation="vertical" />

      <Button
        className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-muted")}
        onClick={setLink}
        size="sm"
        type="button"
        variant="ghost"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Button
        className="h-8 w-8 p-0"
        disabled={!editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Unlink className="h-4 w-4" />
      </Button>

      <Separator className="mx-1 h-8" orientation="vertical" />

      <Button
        className="h-8 w-8 p-0"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        className="h-8 w-8 p-0"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm min-h-[200px] max-w-none p-4 focus:outline-none",
          "prose-headings:font-semibold prose-headings:tracking-tight",
          "prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-xl",
          "prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-lg",
          "prose-p:my-3 prose-p:leading-relaxed",
          "prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6",
          "prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6",
          "prose-li:my-1",
          "prose-blockquote:border-border prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          disabled && "cursor-not-allowed opacity-50"
        ),
      },
    },
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-background",
        className
      )}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
