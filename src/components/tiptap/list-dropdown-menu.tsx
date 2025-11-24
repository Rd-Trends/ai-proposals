"use client";

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import {
  ChevronDownIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  ListTodo as ListTodoIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

type ListType = "bulletList" | "orderedList" | "taskList";

/**
 * Configuration for the list functionality
 */
type UseListConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The type of list to toggle.
   */
  type: ListType;
  /**
   * Whether the button should hide when list is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful toggle.
   */
  onToggled?: () => void;
};

/**
 * Configuration for the list dropdown menu functionality
 */
type UseListDropdownMenuConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The list types to display in the dropdown.
   * @default ["bulletList", "orderedList", "taskList"]
   */
  types?: ListType[];
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean;
};

type ListOption = {
  label: string;
  type: ListType;
  icon: React.ElementType;
};

const listIcons = {
  bulletList: ListIcon,
  orderedList: ListOrderedIcon,
  taskList: ListTodoIcon,
};

const listLabels: Record<ListType, string> = {
  bulletList: "Bullet List",
  orderedList: "Ordered List",
  taskList: "Task List",
};

const LIST_SHORTCUT_KEYS: Record<ListType, string> = {
  bulletList: "mod+shift+8",
  orderedList: "mod+shift+7",
  taskList: "mod+shift+9",
};

const listOptions: ListOption[] = [
  {
    label: "Bullet List",
    type: "bulletList",
    icon: ListIcon,
  },
  {
    label: "Ordered List",
    type: "orderedList",
    icon: ListOrderedIcon,
  },
  {
    label: "Task List",
    type: "taskList",
    icon: ListTodoIcon,
  },
];

// ============================================================================
// List Helper Functions
// ============================================================================

/**
 * Checks if a list can be toggled in the current editor state
 */
function canToggleList(
  editor: Editor | null,
  type: ListType,
  turnInto: boolean = true
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema(type, editor) || isNodeTypeSelected(editor, ["image"]))
    return false;

  if (!turnInto) {
    switch (type) {
      case "bulletList":
        return editor.can().toggleBulletList();
      case "orderedList":
        return editor.can().toggleOrderedList();
      case "taskList":
        return editor.can().toggleList("taskList", "taskItem");
      default:
        return false;
    }
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

  // Either we can set list directly on the selection,
  // or we can clear formatting/nodes to arrive at a list.
  switch (type) {
    case "bulletList":
      return editor.can().toggleBulletList() || editor.can().clearNodes();
    case "orderedList":
      return editor.can().toggleOrderedList() || editor.can().clearNodes();
    case "taskList":
      return (
        editor.can().toggleList("taskList", "taskItem") ||
        editor.can().clearNodes()
      );
    default:
      return false;
  }
}

/**
 * Checks if list is currently active
 */
function isListActive(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false;

  switch (type) {
    case "bulletList":
      return editor.isActive("bulletList");
    case "orderedList":
      return editor.isActive("orderedList");
    case "taskList":
      return editor.isActive("taskList");
    default:
      return false;
  }
}

/**
 * Toggles list in the editor
 */
function toggleList(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleList(editor, type)) return false;

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

    if (editor.isActive(type)) {
      // Unwrap list
      chain
        .liftListItem("listItem")
        .lift("bulletList")
        .lift("orderedList")
        .lift("taskList")
        .run();
    } else {
      // Wrap in specific list type
      const toggleMap: Record<ListType, () => typeof chain> = {
        bulletList: () => chain.toggleBulletList(),
        orderedList: () => chain.toggleOrderedList(),
        taskList: () => chain.toggleList("taskList", "taskItem"),
      };

      const toggle = toggleMap[type];
      if (!toggle) return false;

      toggle().run();
    }

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

/**
 * Determines if the list button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  type: ListType;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, type, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema(type, editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleList(editor, type);
  }

  return true;
}

// ============================================================================
// List Dropdown Menu Helper Functions
// ============================================================================

// ============================================================================
// List Dropdown Menu Helper Functions
// ============================================================================

function canToggleAnyList(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor || !editor.isEditable) return false;
  return listTypes.some((type) => canToggleList(editor, type));
}

function isAnyListActive(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor || !editor.isEditable) return false;
  return listTypes.some((type) => isListActive(editor, type));
}

function getActiveListType(
  editor: Editor | null,
  availableTypes: ListType[]
): ListType | undefined {
  if (!editor || !editor.isEditable) return undefined;
  return availableTypes.find((type) => isListActive(editor, type));
}

function getFilteredListOptions(
  availableTypes: ListType[]
): typeof listOptions {
  return listOptions.filter(
    (option) => !option.type || availableTypes.includes(option.type)
  );
}

function shouldShowListDropdown(params: {
  editor: Editor | null;
  listTypes: ListType[];
  hideWhenUnavailable: boolean;
  listInSchema: boolean;
  canToggleAny: boolean;
}): boolean {
  const { editor, hideWhenUnavailable, listInSchema, canToggleAny } = params;

  if (!listInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleAny;
  }

  return true;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Custom hook that provides list functionality for Tiptap editor
 */
function useList(config: UseListConfig) {
  const {
    editor: providedEditor,
    type,
    hideWhenUnavailable = false,
    onToggled,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggle = canToggleList(editor, type);
  const isActive = isListActive(editor, type);

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

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleList(editor, type);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, type, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: listLabels[type],
    shortcutKeys: LIST_SHORTCUT_KEYS[type],
    Icon: listIcons[type],
  };
}

/**
 * Custom hook that provides list dropdown menu functionality for Tiptap editor
 */
/**
 * Custom hook that provides list dropdown menu functionality for Tiptap editor
 */
function useListDropdownMenu(config?: UseListDropdownMenuConfig) {
  const {
    editor: providedEditor,
    types = ["bulletList", "orderedList", "taskList"],
    hideWhenUnavailable = false,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(false);

  const listInSchema = types.some((type) => isNodeInSchema(type, editor));

  const filteredLists = useMemo(() => getFilteredListOptions(types), [types]);

  const canToggle = canToggleAnyList(editor, types);
  const isActive = isAnyListActive(editor, types);
  const activeType = getActiveListType(editor, types);
  const activeList = filteredLists.find((option) => option.type === activeType);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowListDropdown({
          editor,
          listTypes: types,
          hideWhenUnavailable,
          listInSchema,
          canToggleAny: canToggle,
        })
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [canToggle, editor, hideWhenUnavailable, listInSchema, types]);

  return {
    isVisible,
    activeType,
    isActive,
    canToggle,
    types,
    filteredLists,
    label: "List",
    Icon: activeList ? listIcons[activeList.type] : ListIcon,
  };
}

/**
 * Dropdown menu component for selecting list types in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useListDropdownMenu` hook instead.
 */

type ListDropdownMenuProps = React.ComponentProps<typeof DropdownMenuTrigger> &
  UseListDropdownMenuConfig & {
    className?: string;
    open?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  };

type ListButtonProps = React.ComponentProps<typeof DropdownMenuItem> &
  UseListConfig & {
    /**
     * Optional show shortcut keys in the button.
     * @default false
     */
    showShortcut?: boolean;
  };

const ListButton = ({
  editor: providedEditor,
  type,
  hideWhenUnavailable = false,
  onToggled,
  showShortcut = false,
  onClick,
  children,
  ...buttonProps
}: ListButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isVisible,
    canToggle,
    isActive,
    handleToggle,
    label,
    Icon,
    shortcutKeys,
  } = useList({
    editor,
    type,
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

const ListDropdownMenu = ({
  editor: providedEditor,
  types = ["bulletList", "orderedList", "taskList"],
  hideWhenUnavailable = false,
  onOpenChange,
  className,
  ...buttonProps
}: ListDropdownMenuProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isVisible, isActive, canToggle, Icon } = useListDropdownMenu({
    editor,
    types,
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
          aria-label="Format as list"
          aria-pressed={isActive}
          tooltip="List"
          className={cn("gap-0.5 w-10", className)}
          {...buttonProps}>
          <Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="size-2.5" />
        </EditorButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {types.map((type) => (
          <ListButton
            key={`list-${type}`}
            editor={editor}
            type={type}
            showShortcut
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { useList, useListDropdownMenu, ListDropdownMenu, ListButton };
