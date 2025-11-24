"use client";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import {
  ChevronDownIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  HeadingIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EditorButton } from "@/components/tiptap/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
  parseShortcutKeys,
  selectionWithinConvertibleTypes,
} from "@/lib/tiptap-utils";
import { cn } from "@/lib/utils";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Configuration for the heading functionality
 */
type UseHeadingConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The heading level.
   */
  level: Level;
  /**
   * Whether the button should hide when heading is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful heading toggle.
   */
  onToggled?: () => void;
};

const headingIcons = {
  1: Heading1Icon,
  2: Heading2Icon,
  3: Heading3Icon,
  4: Heading4Icon,
  5: Heading5Icon,
  6: Heading6Icon,
};

const HEADING_SHORTCUT_KEYS: Record<Level, string> = {
  1: "ctrl+alt+1",
  2: "ctrl+alt+2",
  3: "ctrl+alt+3",
  4: "ctrl+alt+4",
  5: "ctrl+alt+5",
  6: "ctrl+alt+6",
};

/**
 * Checks if heading can be toggled in the current editor state
 */
function canToggle(
  editor: Editor | null,
  level?: Level,
  turnInto: boolean = true
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (
    !isNodeInSchema("heading", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  if (!turnInto) {
    return level
      ? editor.can().setNode("heading", { level })
      : editor.can().setNode("heading");
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

  // Either we can set heading directly on the selection,
  // or we can clear formatting/nodes to arrive at a heading.
  return level
    ? editor.can().setNode("heading", { level }) || editor.can().clearNodes()
    : editor.can().setNode("heading") || editor.can().clearNodes();
}

/**
 * Checks if heading is currently active
 */
function isHeadingActive(
  editor: Editor | null,
  level?: Level | Level[]
): boolean {
  if (!editor || !editor.isEditable) return false;

  if (Array.isArray(level)) {
    return level.some((l) => editor.isActive("heading", { level: l }));
  }

  return level
    ? editor.isActive("heading", { level })
    : editor.isActive("heading");
}

/**
 * Toggles heading in the editor
 */
function toggleHeading(editor: Editor | null, level: Level | Level[]): boolean {
  if (!editor || !editor.isEditable) return false;

  const levels = Array.isArray(level) ? level : [level];
  const toggleLevel = levels.find((l) => canToggle(editor, l));

  if (!toggleLevel) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the cursor position
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

    const isActive = levels.some((l) =>
      editor.isActive("heading", { level: l })
    );

    const toggle = isActive
      ? chain.setNode("paragraph")
      : chain.setNode("heading", { level: toggleLevel });

    toggle.run();

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

/**
 * Determines if the heading button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  level?: Level | Level[];
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, level, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("heading", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    if (Array.isArray(level)) {
      return level.some((l) => canToggle(editor, l));
    }
    return canToggle(editor, level);
  }

  return true;
}

/**
 * Custom hook that provides heading functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleHeadingButton() {
 *   const { isVisible, isActive, handleToggle, Icon } = useHeading({ level: 1 })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <button
 *       onClick={handleToggle}
 *       aria-pressed={isActive}
 *     >
 *       <Icon />
 *       Heading 1
 *     </button>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedHeadingButton() {
 *   const { isVisible, isActive, handleToggle, label, Icon } = useHeading({
 *     level: 2,
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onToggled: (isActive) => console.log('Heading toggled:', isActive)
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
 *       <Icon />
 *       Toggle Heading 2
 *     </MyButton>
 *   )
 * }
 * ```
 */
function useHeading(config: UseHeadingConfig) {
  const {
    editor: providedEditor,
    level,
    hideWhenUnavailable = false,
    onToggled,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggleState = canToggle(editor, level);
  const isActive = isHeadingActive(editor, level);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, level, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, level, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleHeading(editor, level);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, level, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label: `Heading ${level}`,
    shortcutKeys: HEADING_SHORTCUT_KEYS[level],
    Icon: headingIcons[level],
  };
}

/**
 * Configuration for the heading dropdown menu functionality
 */
type UseHeadingDropdownMenuConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Available heading levels to show in the dropdown
   * @default [1, 2, 3, 4, 5, 6]
   */
  levels?: Level[];
  /**
   * Whether the dropdown should hide when headings are not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
};

/**
 * Gets the currently active heading level from the available levels
 */
function getActiveHeadingLevel(
  editor: Editor | null,
  levels: Level[] = [1, 2, 3, 4, 5, 6]
): Level | undefined {
  if (!editor || !editor.isEditable) return undefined;
  return levels.find((level) => isHeadingActive(editor, level));
}

/**
 * Custom hook that provides heading dropdown menu functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MyHeadingDropdown() {
 *   const {
 *     isVisible,
 *     activeLevel,
 *     isAnyHeadingActive,
 *     canToggle,
 *     levels,
 *   } = useHeadingDropdownMenu()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <DropdownMenu>
 *       // dropdown content
 *     </DropdownMenu>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedHeadingDropdown() {
 *   const {
 *     isVisible,
 *     activeLevel,
 *   } = useHeadingDropdownMenu({
 *     editor: myEditor,
 *     levels: [1, 2, 3],
 *     hideWhenUnavailable: true,
 *   })
 *
 *   // component implementation
 * }
 * ```
 */
function useHeadingDropdownMenu(config?: UseHeadingDropdownMenuConfig) {
  const {
    editor: providedEditor,
    levels = [1, 2, 3, 4, 5, 6],
    hideWhenUnavailable = false,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);

  const activeLevel = getActiveHeadingLevel(editor, levels);
  const isActive = isHeadingActive(editor);
  const canToggleState = canToggle(editor);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowButton({ editor, hideWhenUnavailable, level: levels })
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, levels]);

  return {
    isVisible,
    activeLevel,
    isActive,
    canToggle: canToggleState,
    levels,
    label: "Heading",
    Icon: activeLevel ? headingIcons[activeLevel] : HeadingIcon,
  };
}

/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useHeadingDropdownMenu` hook instead.
 */

type HeadingDropdownMenuProps = React.ComponentProps<
  typeof DropdownMenuTrigger
> &
  UseHeadingDropdownMenuConfig & {
    className?: string;
    open?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  };

type HeadingDropdownMenuItemProps = React.ComponentProps<
  typeof DropdownMenuItem
> &
  UseHeadingConfig & {
    /**
     * Optional show shortcut keys in the button.
     * @default false
     */
    showShortcut?: boolean;
  };

const HeadingDropdownMenuItem = ({
  editor: providedEditor,
  level,
  hideWhenUnavailable = false,
  onToggled,
  showShortcut = false,
  onClick,
  children,
  ...buttonProps
}: HeadingDropdownMenuItemProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isVisible,
    canToggle,
    isActive,
    handleToggle,
    label,
    Icon,
    shortcutKeys,
  } = useHeading({
    editor,
    level,
    hideWhenUnavailable,
    onToggled,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
    <DropdownMenuItem
      onClick={handleClick}
      disabled={!canToggle}
      className={cn("", {
        "bg-accent text-accent-foreground": isActive,
      })}
      {...buttonProps}>
      {children ?? (
        <>
          <Icon className="tiptap-button-icon" />
          {label && <span className="tiptap-button-text">{label}</span>}
          {showShortcut && (
            <Kbd>{parseShortcutKeys({ shortcutKeys }).join("+")}</Kbd>
          )}
        </>
      )}
    </DropdownMenuItem>
  );
};

const HeadingDropdownMenu = ({
  editor: providedEditor,
  levels = [1, 2, 3, 4, 5, 6],
  hideWhenUnavailable = false,
  onOpenChange,
  className,
  ...buttonProps
}: HeadingDropdownMenuProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isVisible, isActive, canToggle, Icon } = useHeadingDropdownMenu({
    editor,
    levels,
    hideWhenUnavailable,
  });

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!editor || !canToggle) return;
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [canToggle, editor, onOpenChange]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <EditorButton
          type="button"
          isActive={isActive}
          aria-label="Format text as heading"
          aria-pressed={isActive}
          tooltip="Heading"
          className={cn("gap-0.5 w-10", className)}
          {...buttonProps}>
          <Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="size-2.5" />
        </EditorButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {levels.map((level) => (
          <HeadingDropdownMenuItem
            key={`heading-${level}`}
            editor={editor}
            level={level}
            showShortcut
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export {
  useHeading,
  HeadingDropdownMenu,
  useHeadingDropdownMenu,
  canToggle,
  isHeadingActive,
  toggleHeading,
};
