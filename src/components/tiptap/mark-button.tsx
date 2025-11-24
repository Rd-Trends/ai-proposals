"use client";

import type { Editor } from "@tiptap/react";
import {
  BoldIcon,
  CodeXmlIcon,
  ItalicIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { EditorButtonProps } from "@/components/tiptap/button";
import { EditorButton } from "@/components/tiptap/button";
import { Badge } from "@/components/ui/badge";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import {
  isMarkInSchema,
  isNodeTypeSelected,
  parseShortcutKeys,
} from "@/lib/tiptap-utils";

type Mark =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "underline"
  | "superscript"
  | "subscript";

/**
 * Configuration for the mark functionality
 */
type UseMarkConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The type of mark to toggle
   */
  type: Mark;
  /**
   * Whether the button should hide when mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful mark toggle.
   */
  onToggled?: () => void;
};

const markIcons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikethroughIcon,
  code: CodeXmlIcon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
};

const MARK_SHORTCUT_KEYS: Record<Mark, string> = {
  bold: "mod+b",
  italic: "mod+i",
  underline: "mod+u",
  strike: "mod+shift+s",
  code: "mod+e",
  superscript: "mod+.",
  subscript: "mod+,",
};

/**
 * Checks if a mark can be toggled in the current editor state
 */
function canToggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema(type, editor) || isNodeTypeSelected(editor, ["image"]))
    return false;

  return editor.can().toggleMark(type);
}

/**
 * Checks if a mark is currently active
 */
function isMarkActive(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive(type);
}

/**
 * Toggles a mark in the editor
 */
function toggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleMark(editor, type)) return false;

  return editor.chain().focus().toggleMark(type).run();
}

/**
 * Determines if the mark button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  type: Mark;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, type, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema(type, editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleMark(editor, type);
  }

  return true;
}

/**
 * Gets the formatted mark name
 */
function getFormattedMarkName(type: Mark): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Custom hook that provides mark functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleBoldButton() {
 *   const { isVisible, handleMark } = useMark({ type: "bold" })
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleMark}>Bold</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedItalicButton() {
 *   const { isVisible, handleMark, label, isActive } = useMark({
 *     editor: myEditor,
 *     type: "italic",
 *     hideWhenUnavailable: true,
 *     onToggled: () => console.log('Mark toggled!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleMark}
 *       aria-pressed={isActive}
 *       aria-label={label}
 *     >
 *       Italic
 *     </MyButton>
 *   )
 * }
 * ```
 */
function useMark(config: UseMarkConfig) {
  const {
    editor: providedEditor,
    type,
    hideWhenUnavailable = false,
    onToggled,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggle = canToggleMark(editor, type);
  const isActive = isMarkActive(editor, type);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, type, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, type, hideWhenUnavailable]);

  const handleMark = useCallback(() => {
    if (!editor) return false;

    const success = toggleMark(editor, type);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, type, onToggled]);

  return {
    isVisible,
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type),
    shortcutKeys: MARK_SHORTCUT_KEYS[type],
    Icon: markIcons[type],
  };
}

type MarkButtonProps = Omit<EditorButtonProps, "type"> &
  UseMarkConfig & {
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

function MarkShortcutBadge({
  type,
  shortcutKeys = MARK_SHORTCUT_KEYS[type],
}: {
  type: Mark;
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling marks in a Tiptap editor.
 *
 * For custom button implementations, use the `useMark` hook instead.
 */
const MarkButton = ({
  editor: providedEditor,
  type,
  text,
  hideWhenUnavailable = false,
  onToggled,
  showShortcut = false,
  onClick,
  children,
  ...buttonProps
}: MarkButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isVisible,
    handleMark,
    label,
    canToggle,
    isActive,
    Icon,
    shortcutKeys,
  } = useMark({
    editor,
    type,
    hideWhenUnavailable,
    onToggled,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      handleMark();
    },
    [handleMark, onClick]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <EditorButton
      type="button"
      disabled={!canToggle}
      isActive={isActive}
      tabIndex={-1}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      onClick={handleClick}
      {...buttonProps}>
      {children ?? (
        <>
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <MarkShortcutBadge type={type} shortcutKeys={shortcutKeys} />
          )}
        </>
      )}
    </EditorButton>
  );
};

export { MarkButton, useMark, canToggleMark, isMarkActive, toggleMark };
