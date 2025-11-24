"use client";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { FileCode2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
  parseShortcutKeys,
  selectionWithinConvertibleTypes,
} from "@/lib/tiptap-utils";
import { EditorButton, type EditorButtonProps } from "./button";

export const CODE_BLOCK_SHORTCUT_KEY = "mod+alt+c";

/**
 * Configuration for the code block functionality
 */
type UseCodeBlockConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the button should hide when code block is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful code block toggle.
   */
  onToggled?: () => void;
};

/**
 * Checks if code block can be toggled in the current editor state
 */
function canToggleCodeBlock(
  editor: Editor | null,
  turnInto: boolean = true
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (
    !isNodeInSchema("codeBlock", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  if (!turnInto) {
    return editor.can().toggleNode("codeBlock", "paragraph");
  }

  // Ensure selection is in nodes we're allowed to convert
  if (
    !selectionWithinConvertibleTypes(editor, [
      "paragraph",
      "heading",
      "bulletList",
      "orderedList",
      "taskList",
      "blockquote",
      "codeBlock",
    ])
  )
    return false;

  // Either we can toggle code block directly on the selection,
  // or we can clear formatting/nodes to arrive at a code block.
  return (
    editor.can().toggleNode("codeBlock", "paragraph") ||
    editor.can().clearNodes()
  );
}

/**
 * Toggles code block in the editor
 */
function toggleCodeBlock(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleCodeBlock(editor)) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;

      tr = tr.setSelection(NodeSelection.create(state.doc, pos));
      view.dispatch(tr);
      state = view.state;
    }

    const selection = state.selection;

    let chain = editor.chain().focus();

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild;
      const lastChild = selection.node.lastChild?.lastChild;

      const from = firstChild
        ? selection.from + firstChild.nodeSize
        : selection.from + 1;

      const to = lastChild
        ? selection.to - lastChild.nodeSize
        : selection.to - 1;

      const resolvedFrom = state.doc.resolve(from);
      const resolvedTo = state.doc.resolve(to);

      chain = chain
        .setTextSelection(TextSelection.between(resolvedFrom, resolvedTo))
        .clearNodes();
    }

    const toggle = editor.isActive("codeBlock")
      ? chain.setNode("paragraph")
      : chain.toggleNode("codeBlock", "paragraph");

    toggle.run();

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

/**
 * Determines if the code block button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("codeBlock", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleCodeBlock(editor);
  }

  return true;
}

/**
 * Custom hook that provides code block functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage - no params needed
 * function MySimpleCodeBlockButton() {
 *   const { isVisible, isActive, handleToggle } = useCodeBlock()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <button
 *       onClick={handleToggle}
 *       aria-pressed={isActive}
 *     >
 *       Code Block
 *     </button>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedCodeBlockButton() {
 *   const { isVisible, isActive, handleToggle, label } = useCodeBlock({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onToggled: (isActive) => console.log('Code block toggled:', isActive)
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleToggle}
 *       aria-label={label}
 *       aria-pressed={isActive}
 *     >
 *       Toggle Code Block
 *     </MyButton>
 *   )
 * }
 * ```
 */
function useCodeBlock(config?: UseCodeBlockConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onToggled,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggleState = canToggleCodeBlock(editor);
  const isActive = editor?.isActive("codeBlock") || false;

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleCodeBlock(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label: "Code Block",
    shortcutKeys: CODE_BLOCK_SHORTCUT_KEY,
    Icon: FileCode2Icon,
  };
}

export type CodeBlockButtonProps = EditorButtonProps &
  UseCodeBlockConfig & {
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

/**
 * Button component for toggling code block in a Tiptap editor.
 *
 * For custom button implementations, use the `useCodeBlock` hook instead.
 */
const CodeBlockButton = ({
  editor: providedEditor,
  text,
  hideWhenUnavailable = false,
  onToggled,
  showShortcut = false,
  onClick,
  children,
  ...buttonProps
}: CodeBlockButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isVisible,
    canToggle,
    isActive,
    handleToggle,
    label,
    shortcutKeys,
    Icon,
  } = useCodeBlock({
    editor,
    hideWhenUnavailable,
    onToggled,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      handleToggle();
    },
    [handleToggle, onClick]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <EditorButton
      aria-label={label}
      disabled={!canToggle}
      isActive={isActive}
      onClick={handleClick}
      shortcutKeys={shortcutKeys}
      tooltip="Code Block"
      type="button"
      {...buttonProps}
    >
      {children ?? (
        <>
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <Badge>
              {parseShortcutKeys({
                shortcutKeys: shortcutKeys || CODE_BLOCK_SHORTCUT_KEY,
              })}
            </Badge>
          )}
        </>
      )}
    </EditorButton>
  );
};

export { CodeBlockButton, useCodeBlock, canToggleCodeBlock, toggleCodeBlock };
