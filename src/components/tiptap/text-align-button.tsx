"use client";

import type { ChainedCommands, Editor } from "@tiptap/react";
import {
  AlignCenter as AlignCenterIcon,
  AlignJustify as AlignJustifyIcon,
  AlignLeft as AlignLeftIcon,
  AlignRight as AlignRightIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { EditorButtonProps } from "@/components/tiptap/button";
import { EditorButton } from "@/components/tiptap/button";
import { Badge } from "@/components/ui/badge";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import {
  isExtensionAvailable,
  isNodeTypeSelected,
  parseShortcutKeys,
} from "@/lib/tiptap-utils";

type TextAlign = "left" | "center" | "right" | "justify";

/**
 * Configuration for the text align functionality
 */
type UseTextAlignConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The text alignment to apply.
   */
  align: TextAlign;
  /**
   * Whether the button should hide when alignment is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful alignment change.
   */
  onAligned?: () => void;
};

const TEXT_ALIGN_SHORTCUT_KEYS: Record<TextAlign, string> = {
  left: "mod+shift+l",
  center: "mod+shift+e",
  right: "mod+shift+r",
  justify: "mod+shift+j",
};

const textAlignIcons = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
  justify: AlignJustifyIcon,
};

const textAlignLabels: Record<TextAlign, string> = {
  left: "Align left",
  center: "Align center",
  right: "Align right",
  justify: "Align justify",
};

/**
 * Checks if text alignment can be performed in the current editor state
 */
function canSetTextAlign(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false;
  if (
    !isExtensionAvailable(editor, "textAlign") ||
    isNodeTypeSelected(editor, ["image", "horizontalRule"])
  )
    return false;

  return editor.can().setTextAlign(align);
}

function hasSetTextAlign(
  commands: ChainedCommands
): commands is ChainedCommands & {
  setTextAlign: (align: TextAlign) => ChainedCommands;
} {
  return "setTextAlign" in commands;
}

/**
 * Checks if the text alignment is currently active
 */
function isTextAlignActive(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive({ textAlign: align });
}

/**
 * Sets text alignment in the editor
 */
function setTextAlign(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canSetTextAlign(editor, align)) return false;

  const chain = editor.chain().focus();
  if (hasSetTextAlign(chain)) {
    return chain.setTextAlign(align).run();
  }

  return false;
}

/**
 * Determines if the text align button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  align: TextAlign;
}): boolean {
  const { editor, hideWhenUnavailable, align } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, "textAlign")) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canSetTextAlign(editor, align);
  }

  return true;
}

/**
 * Custom hook that provides text align functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleAlignButton() {
 *   const { isVisible, handleTextAlign } = useTextAlign({ align: "center" })
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleTextAlign}>Align Center</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedAlignButton() {
 *   const { isVisible, handleTextAlign, label, isActive } = useTextAlign({
 *     editor: myEditor,
 *     align: "right",
 *     hideWhenUnavailable: true,
 *     onAligned: () => console.log('Text aligned!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleTextAlign}
 *       aria-pressed={isActive}
 *       aria-label={label}
 *     >
 *       Align Right
 *     </MyButton>
 *   )
 * }
 * ```
 */
function useTextAlign(config: UseTextAlignConfig) {
  const {
    editor: providedEditor,
    align,
    hideWhenUnavailable = false,
    onAligned,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canAlign = canSetTextAlign(editor, align);
  const isActive = isTextAlignActive(editor, align);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, align, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, align]);

  const handleTextAlign = useCallback(() => {
    if (!editor) return false;

    const success = setTextAlign(editor, align);
    if (success) {
      onAligned?.();
    }
    return success;
  }, [editor, align, onAligned]);

  return {
    isVisible,
    isActive,
    handleTextAlign,
    canAlign,
    label: textAlignLabels[align],
    shortcutKeys: TEXT_ALIGN_SHORTCUT_KEYS[align],
    Icon: textAlignIcons[align],
  };
}

type IconProps = React.SVGProps<SVGSVGElement>;
type IconComponent = ({ className, ...props }: IconProps) => React.ReactElement;

type TextAlignButtonProps = Omit<EditorButtonProps, "type"> &
  UseTextAlignConfig & {
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Optional show shortcut keys in the button.
     * @default false
     */
    showShortcut?: boolean;
    /**
     * Optional custom icon component to render instead of the default.
     */
    icon?: React.MemoExoticComponent<IconComponent> | React.FC<IconProps>;
  };

function TextAlignShortcutBadge({
  align,
  shortcutKeys = TEXT_ALIGN_SHORTCUT_KEYS[align],
}: {
  align: TextAlign;
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for setting text alignment in a Tiptap editor.
 *
 * For custom button implementations, use the `useTextAlign` hook instead.
 */
const TextAlignButton = ({
  editor: providedEditor,
  align,
  text,
  hideWhenUnavailable = false,
  onAligned,
  showShortcut = false,
  onClick,
  icon: CustomIcon,
  children,
  ...buttonProps
}: TextAlignButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isVisible,
    handleTextAlign,
    label,
    canAlign,
    isActive,
    Icon,
    shortcutKeys,
  } = useTextAlign({
    editor,
    align,
    hideWhenUnavailable,
    onAligned,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      handleTextAlign();
    },
    [handleTextAlign, onClick]
  );

  if (!isVisible) {
    return null;
  }

  const RenderIcon = CustomIcon ?? Icon;

  return (
    <EditorButton
      type="button"
      disabled={!canAlign}
      data-style="ghost"
      data-active-state={isActive ? "on" : "off"}
      data-disabled={!canAlign}
      tabIndex={-1}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      onClick={handleClick}
      {...buttonProps}>
      {children ?? (
        <>
          <RenderIcon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <TextAlignShortcutBadge align={align} shortcutKeys={shortcutKeys} />
          )}
        </>
      )}
    </EditorButton>
  );
};

export {
  TextAlignButton,
  useTextAlign,
  canSetTextAlign,
  isTextAlignActive,
  setTextAlign,
};
