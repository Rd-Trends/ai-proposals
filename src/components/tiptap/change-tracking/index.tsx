// components/ChangesToolbar.tsx
import { Editor } from "@tiptap/core";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  acceptAllChanges,
  acceptChange,
  findAllChanges,
  rejectAllChanges,
  rejectChange,
} from "./helpers";

interface ChangesToolbarProps {
  editor: Editor;
  className?: string;
}

export const ChangesToolbar = ({ editor, className }: ChangesToolbarProps) => {
  const [changes, setChanges] = useState(() => findAllChanges(editor));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update changes list when editor content changes
  useEffect(() => {
    const updateChanges = () => {
      const newChanges = findAllChanges(editor);
      setChanges(newChanges);

      //   get current index from editor selection
      const { from } = editor.state.selection;
      const newIndex = newChanges.findIndex(
        (change) => from >= change.from && from <= change.to
      );
      setCurrentIndex(newIndex === -1 ? 0 : newIndex);
    };

    editor.on("update", updateChanges);

    return () => {
      editor.off("update", updateChanges);
    };
  }, [editor, currentIndex]);

  const currentChange = changes[currentIndex];

  const goToChange = (index: number) => {
    if (index >= 0 && index < changes.length) {
      setCurrentIndex(index);
      const change = changes[index];

      // Scroll to and highlight the change
      editor
        .chain()
        .focus()
        .setTextSelection({ from: change.from, to: change.to })
        .scrollIntoView()
        .run();
    }
  };

  const handleAccept = () => {
    if (currentChange) {
      acceptChange(editor, currentChange);
    }
  };

  const handleReject = () => {
    if (currentChange) {
      rejectChange(editor, currentChange);
    }
  };

  const handleAcceptAll = () => {
    acceptAllChanges(editor);
    setCurrentIndex(0);
  };

  const handleRejectAll = () => {
    rejectAllChanges(editor);
    setCurrentIndex(0);
  };

  if (changes.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute bottom-28 inset-x-0 flex items-center w-fit mx-auto gap-2 px-4 py-2 border bg-popover text-muted-foreground rounded-lg",
        className
      )}
    >
      {/* Accept/Reject All */}
      <div className="flex gap-1">
        <Button onClick={handleRejectAll} size="sm" variant="ghost">
          Reject All
        </Button>
        <Button onClick={handleAcceptAll} size="sm" variant="ghost">
          Accept All
        </Button>
      </div>

      <Separator className="h-5!" orientation="vertical" />

      {/* Navigation Section */}
      <div className="flex items-center gap-1">
        <Button
          disabled={currentIndex === 0}
          onClick={() => goToChange(currentIndex - 1)}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <span className="text-xs font-medium">
          {currentIndex + 1} / {changes.length}
        </span>

        <Button
          disabled={currentIndex === changes.length - 1}
          onClick={() => goToChange(currentIndex + 1)}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* Accept/Reject Current */}
      <div className="flex gap-1">
        <Button onClick={handleReject} size="sm" variant="secondary">
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
        <Button onClick={handleAccept} size="sm">
          <Check className="h-4 w-4 mr-1" />
          Accept
        </Button>
      </div>

      <Separator className="h-6!" orientation="vertical" />

      <Button onClick={handleRejectAll} size="icon-sm" variant="ghost">
        <X className="size-5" />
      </Button>
    </div>
  );
};
