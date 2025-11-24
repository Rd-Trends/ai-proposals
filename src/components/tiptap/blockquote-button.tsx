"use client";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { TextQuoteIcon } from "lucide-react";
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

const BLOCKQUOTE_SHORTCUT_KEY = "mod+shift+b";

/**
 * Configuration for the blockquote functionality
 */
type UseBlockquoteConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the button should hide when blockquote is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful toggle.
   */
  onToggled?: () => void;
};

/**
 * Checks if blockquote can be toggled in the current editor state
 */
function canToggleBlockquote(
  editor: Editor | null,
  turnInto: boolean = true
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (
    !isNodeInSchema("blockquote", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  if (!turnInto) {
    return editor.can().toggleWrap("blockquote");
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

  // Either we can wrap in blockquote directly on the selection,
  // or we can clear formatting/nodes to arrive at a blockquote.
  return editor.can().toggleWrap("blockquote") || editor.can().clearNodes();
}

/**
 * Toggles blockquote formatting for a specific node or the current selection
 */
function toggleBlockquote(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleBlockquote(editor)) return false;

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

    const toggle = editor.isActive("blockquote")
      ? chain.lift("blockquote")
      : chain.wrapIn("blockquote");

    toggle.run();

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

/**
 * Determines if the blockquote button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("blockquote", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleBlockquote(editor);
  }

  return true;
}

function useBlockquote(config?: UseBlockquoteConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onToggled,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggle = canToggleBlockquote(editor);
  const isActive = editor?.isActive("blockquote") || false;

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

    const success = toggleBlockquote(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: "Blockquote",
    shortcutKeys: BLOCKQUOTE_SHORTCUT_KEY,
    Icon: TextQuoteIcon,
  };
}

type BlockquoteButtonProps = EditorButtonProps &
  UseBlockquoteConfig & {
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

const BlockquoteButton = ({
  editor: providedEditor,
  text,
  hideWhenUnavailable = false,
  onToggled,
  showShortcut = false,
  onClick,
  children,
  ...buttonProps
}: BlockquoteButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isVisible,
    canToggle,
    isActive,
    handleToggle,
    label,
    shortcutKeys,
    Icon,
  } = useBlockquote({
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
      tooltip="Blockquote"
      onClick={handleClick}
      isActive={isActive}
      shortcutKeys={shortcutKeys}
      aria-label={label}
      disabled={!canToggle}
      {...buttonProps}>
      {children ?? (
        <>
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <Badge>
              {parseShortcutKeys({
                shortcutKeys: shortcutKeys || BLOCKQUOTE_SHORTCUT_KEY,
              })}
            </Badge>
          )}
        </>
      )}
    </EditorButton>
  );
};

export {
  BlockquoteButton,
  useBlockquote,
  canToggleBlockquote,
  toggleBlockquote,
};
