"use client";

import type { Editor } from "@tiptap/react";
import { Redo2 as Redo2Icon, Undo2 as Undo2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { EditorButtonProps } from "@/components/tiptap/button";
import { EditorButton } from "@/components/tiptap/button";
import { Badge } from "@/components/ui/badge";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { isNodeTypeSelected, parseShortcutKeys } from "@/lib/tiptap-utils";

type UndoRedoAction = "undo" | "redo";

/**
 * Configuration for the history functionality
 */
type UseUndoRedoConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The history action to perform (undo or redo).
   */
  action: UndoRedoAction;
  /**
   * Whether the button should hide when action is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful action execution.
   */
  onExecuted?: () => void;
};

const UNDO_REDO_SHORTCUT_KEYS: Record<UndoRedoAction, string> = {
  undo: "mod+z",
  redo: "mod+shift+z",
};

const historyActionLabels: Record<UndoRedoAction, string> = {
  undo: "Undo",
  redo: "Redo",
};

const historyIcons = {
  undo: Undo2Icon,
  redo: Redo2Icon,
};

/**
 * Checks if a history action can be executed
 */
function canExecuteUndoRedoAction(
  editor: Editor | null,
  action: UndoRedoAction
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (isNodeTypeSelected(editor, ["image"])) return false;

  return action === "undo" ? editor.can().undo() : editor.can().redo();
}

/**
 * Executes a history action on the editor
 */
function executeUndoRedoAction(
  editor: Editor | null,
  action: UndoRedoAction
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canExecuteUndoRedoAction(editor, action)) return false;

  const chain = editor.chain().focus();
  return action === "undo" ? chain.undo().run() : chain.redo().run();
}

/**
 * Determines if the history button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  action: UndoRedoAction;
}): boolean {
  const { editor, hideWhenUnavailable, action } = props;

  if (!editor || !editor.isEditable) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canExecuteUndoRedoAction(editor, action);
  }

  return true;
}

/**
 * Custom hook that provides history functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleUndoButton() {
 *   const { isVisible, handleAction } = useHistory({ action: "undo" })
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleAction}>Undo</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedRedoButton() {
 *   const { isVisible, handleAction, label } = useHistory({
 *     editor: myEditor,
 *     action: "redo",
 *     hideWhenUnavailable: true,
 *     onExecuted: () => console.log('Action executed!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleAction}
 *       aria-label={label}
 *     >
 *       Redo
 *     </MyButton>
 *   )
 * }
 * ```
 */
function useUndoRedo(config: UseUndoRedoConfig) {
  const {
    editor: providedEditor,
    action,
    hideWhenUnavailable = false,
    onExecuted,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canExecute = canExecuteUndoRedoAction(editor, action);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable, action }));
    };

    handleUpdate();

    editor.on("transaction", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
    };
  }, [editor, hideWhenUnavailable, action]);

  const handleAction = useCallback(() => {
    if (!editor) return false;

    const success = executeUndoRedoAction(editor, action);
    if (success) {
      onExecuted?.();
    }
    return success;
  }, [editor, action, onExecuted]);

  return {
    isVisible,
    handleAction,
    canExecute,
    label: historyActionLabels[action],
    shortcutKeys: UNDO_REDO_SHORTCUT_KEYS[action],
    Icon: historyIcons[action],
  };
}

type UndoRedoButtonProps = Omit<EditorButtonProps, "type"> &
  UseUndoRedoConfig & {
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Optional show shortcut keys in the button.
     * @default false
     */
    showShortcut?: boolean;
  };

function HistoryShortcutBadge({
  action,
  shortcutKeys = UNDO_REDO_SHORTCUT_KEYS[action],
}: {
  action: UndoRedoAction;
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for triggering undo/redo actions in a Tiptap editor.
 *
 * For custom button implementations, use the `useHistory` hook instead.
 */
const UndoRedoButton = ({
  editor: providedEditor,
  action,
  text,
  hideWhenUnavailable = false,
  onExecuted,
  showShortcut = false,
  onClick,
  children,
  ...buttonProps
}: UndoRedoButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const { isVisible, handleAction, label, canExecute, Icon, shortcutKeys } =
    useUndoRedo({
      editor,
      action,
      hideWhenUnavailable,
      onExecuted,
    });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      handleAction();
    },
    [handleAction, onClick]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <EditorButton
      type="button"
      disabled={!canExecute}
      data-style="ghost"
      data-disabled={!canExecute}
      tabIndex={-1}
      aria-label={label}
      tooltip={label}
      onClick={handleClick}
      {...buttonProps}>
      {children ?? (
        <>
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <HistoryShortcutBadge action={action} shortcutKeys={shortcutKeys} />
          )}
        </>
      )}
    </EditorButton>
  );
};

export { UndoRedoButton, useUndoRedo };
