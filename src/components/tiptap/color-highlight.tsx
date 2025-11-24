"use client";

import type { Editor } from "@tiptap/react";
import { Ban as BanIcon, Highlighter as HighlighterIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { EditorButtonProps } from "@/components/tiptap/button";
import { EditorButton } from "@/components/tiptap/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useMenuNavigation } from "@/hooks/use-menu-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import {
  isExtensionAvailable,
  isMarkInSchema,
  isNodeTypeSelected,
} from "@/lib/tiptap-utils";
import { cn } from "@/lib/utils";

const COLOR_HIGHLIGHT_SHORTCUT_KEY = "mod+shift+h";
const HIGHLIGHT_COLORS = [
  { id: "primary", label: "Primary Color", value: "var(--primary)" },
  { id: "red", label: "Red", value: "var(--destructive)" },
  { id: "green", label: "Green", value: "var(--color-green-500)" },
  { id: "blue", label: "Blue", value: "var(--color-blue-500)" },
  { id: "yellow", label: "Yellow", value: "var(--color-yellow-500)" },
  { id: "purple", label: "Purple", value: "var(--color-purple-500)" },
  { id: "pink", label: "Pink", value: "var(--color-pink-500)" },
  { id: "orange", label: "Orange", value: "var(--color-orange-500)" },
  { id: "brown", label: "Brown", value: "var(--color-amber-700)" },
] as const;
type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

type HighlightMode = "mark" | "node";

/**
 * Configuration for the color highlight functionality
 */
type UseColorHighlightConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The color to apply when toggling the highlight.
   */
  highlightColor?: string;
  /**
   * Optional label to display alongside the icon.
   */
  label?: string;
  /**
   * Whether the button should hide when the mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * The highlighting mode to use.
   * - "mark": Uses the highlight mark extension (default)
   * - "node": Uses the node background extension
   * @default "mark"
   */
  mode?: HighlightMode;
  /**
   * Called when the highlight is applied.
   */
  onApplied?: ({
    color,
    label,
    mode,
  }: {
    color: string;
    label: string;
    mode: HighlightMode;
  }) => void;
};

function pickHighlightColorsByValue(
  values: Array<(typeof HIGHLIGHT_COLORS)[number]["id"]>
) {
  const colorMap = new Map(HIGHLIGHT_COLORS.map((color) => [color.id, color]));
  return values
    .map((id) => colorMap.get(id))
    .filter((color): color is (typeof HIGHLIGHT_COLORS)[number] => !!color);
}

/**
 * Checks if highlight can be applied based on the mode and current editor state
 */
function canColorHighlight(
  editor: Editor | null,
  mode: HighlightMode = "mark"
): boolean {
  if (!editor || !editor.isEditable) return false;

  if (mode === "mark") {
    if (
      !isMarkInSchema("highlight", editor) ||
      isNodeTypeSelected(editor, ["image"])
    )
      return false;

    return editor.can().setMark("highlight");
  } else {
    if (!isExtensionAvailable(editor, ["nodeBackground"])) return false;

    try {
      return editor.can().toggleHighlight({ color: "test" });
    } catch {
      return false;
    }
  }
}

/**
 * Checks if highlight is currently active
 */
function isColorHighlightActive(
  editor: Editor | null,
  highlightColor?: string,
  mode: HighlightMode = "mark"
): boolean {
  if (!editor || !editor.isEditable) return false;

  if (mode === "mark") {
    return highlightColor
      ? editor.isActive("highlight", { color: highlightColor })
      : editor.isActive("highlight");
  } else {
    if (!highlightColor) return false;

    try {
      const { state } = editor;
      const { selection } = state;

      const $pos = selection.$anchor;
      for (let depth = $pos.depth; depth >= 0; depth--) {
        const node = $pos.node(depth);
        if (node && node.attrs?.backgroundColor === highlightColor) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }
}

/**
 * Removes highlight based on the mode
 */
function removeHighlight(
  editor: Editor | null,
  mode: HighlightMode = "mark"
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canColorHighlight(editor, mode)) return false;

  if (mode === "mark") {
    return editor.chain().focus().unsetMark("highlight").run();
  } else {
    return editor.chain().focus().unsetHighlight().run();
  }
}

/**
 * Determines if the highlight button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  mode: HighlightMode;
}): boolean {
  const { editor, hideWhenUnavailable, mode } = props;

  if (!editor || !editor.isEditable) return false;

  if (mode === "mark") {
    if (!isMarkInSchema("highlight", editor)) return false;
  } else {
    if (!isExtensionAvailable(editor, ["nodeBackground"])) return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canColorHighlight(editor, mode);
  }

  return true;
}

function useColorHighlight(config: UseColorHighlightConfig) {
  const {
    editor: providedEditor,
    label,
    highlightColor,
    hideWhenUnavailable = false,
    mode = "mark",
    onApplied,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canColorHighlightState = canColorHighlight(editor, mode);
  const isActive = isColorHighlightActive(editor, highlightColor, mode);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable, mode }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, mode]);

  const handleColorHighlight = useCallback(() => {
    if (!editor || !canColorHighlightState || !highlightColor || !label)
      return false;

    if (mode === "mark") {
      if (editor.state.storedMarks) {
        const highlightMarkType = editor.schema.marks.highlight;
        if (highlightMarkType) {
          editor.view.dispatch(
            editor.state.tr.removeStoredMark(highlightMarkType)
          );
        }
      }

      setTimeout(() => {
        const success = editor
          .chain()
          .focus()
          .toggleMark("highlight", { color: highlightColor })
          .run();
        if (success) {
          onApplied?.({ color: highlightColor, label, mode });
        }
        return success;
      }, 0);

      return true;
    } else {
      const success = editor
        .chain()
        .focus()
        .toggleHighlight({ color: highlightColor })
        .run();

      if (success) {
        onApplied?.({ color: highlightColor, label, mode });
      }
      return success;
    }
  }, [canColorHighlightState, highlightColor, editor, label, onApplied, mode]);

  const handleRemoveHighlight = useCallback(() => {
    const success = removeHighlight(editor, mode);
    if (success) {
      onApplied?.({ color: "", label: "Remove highlight", mode });
    }
    return success;
  }, [editor, onApplied, mode]);

  useHotkeys(
    COLOR_HIGHLIGHT_SHORTCUT_KEY,
    (event) => {
      event.preventDefault();
      handleColorHighlight();
    },
    {
      enabled: isVisible && canColorHighlightState,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  );

  return {
    isVisible,
    isActive,
    handleColorHighlight,
    handleRemoveHighlight,
    canColorHighlight: canColorHighlightState,
    label: label || `Highlight`,
    shortcutKeys: COLOR_HIGHLIGHT_SHORTCUT_KEY,
    Icon: HighlighterIcon,
    mode,
  };
}

type ColorHighlightButtonProps = Omit<EditorButtonProps, "type"> &
  UseColorHighlightConfig & {
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
 * Button component for applying color highlights in a Tiptap editor.
 *
 * Supports two highlighting modes:
 * - "mark": Uses the highlight mark extension (default)
 * - "node": Uses the node background extension
 *
 * For custom button implementations, use the `useColorHighlight` hook instead.
 *
 * @example
 * ```tsx
 * // Mark-based highlighting (default)
 * <ColorHighlightButton highlightColor="yellow" />
 *
 * // Node-based background coloring
 * <ColorHighlightButton
 *   highlightColor="var(--tt-color-highlight-blue)"
 *   mode="node"
 * />
 *
 * // With custom callback
 * <ColorHighlightButton
 *   highlightColor="red"
 *   mode="mark"
 *   onApplied={({ color, mode }) => console.log(`Applied ${color} in ${mode} mode`)}
 * />
 * ```
 */
const ColorHighlightButton = ({
  editor: providedEditor,
  highlightColor,
  text,
  hideWhenUnavailable = false,
  mode = "mark",
  onApplied,
  showShortcut = false,
  onClick,
  children,
  style,
  className,
  ...buttonProps
}: ColorHighlightButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isVisible,
    canColorHighlight,
    isActive,
    handleColorHighlight,
    label,
    shortcutKeys,
  } = useColorHighlight({
    editor,
    highlightColor,
    label: text || `Toggle highlight (${highlightColor})`,
    hideWhenUnavailable,
    mode,
    onApplied,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      handleColorHighlight();
    },
    [handleColorHighlight, onClick]
  );

  const buttonStyle = useMemo(
    () =>
      ({
        ...style,
        "--highlight-color": highlightColor,
      } as React.CSSProperties),
    [highlightColor, style]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <EditorButton
      type="button"
      tabIndex={-1}
      disabled={!canColorHighlight}
      variant={isActive ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      shortcutKeys={shortcutKeys}
      onClick={handleClick}
      style={buttonStyle}
      className={cn("rounded-2xl p-0", className)}
      {...buttonProps}>
      <span className="size-5 bg-(--highlight-color) rounded-full" />
    </EditorButton>
  );
};

interface ColorHighlightPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[];
}

interface ColorHighlightPopoverProps
  extends Omit<EditorButtonProps, "type">,
    Pick<
      UseColorHighlightConfig,
      "editor" | "hideWhenUnavailable" | "onApplied"
    > {
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[];
}

const ColorHighlightPopoverButton = ({
  className,
  children,
  ...props
}: EditorButtonProps) => (
  <EditorButton
    type="button"
    className={className}
    tabIndex={-1}
    aria-label="Highlight text"
    tooltip="Highlight"
    {...props}>
    {children ?? <HighlighterIcon className="tiptap-button-icon" />}
  </EditorButton>
);

function ColorHighlightPopoverContent({
  editor,
  colors = pickHighlightColorsByValue([
    "primary",
    "red",
    "green",
    "blue",
    "yellow",
    "purple",
    "pink",
    "orange",
    "brown",
  ]),
}: ColorHighlightPopoverContentProps) {
  const { handleRemoveHighlight } = useColorHighlight({ editor });
  const containerRef = useRef<HTMLDivElement>(null);

  const menuItems = useMemo(
    () => [...colors, { label: "Remove highlight", value: "none" }],
    [colors]
  );

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false;
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement;
      if (highlightedElement) highlightedElement.click();
      if (item.value === "none") handleRemoveHighlight();
      return true;
    },
    autoSelectFirstItem: false,
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-8 flex flex-row items-center gap-1">
      {colors.map((color, index) => (
        <ColorHighlightButton
          key={color.value}
          editor={editor}
          highlightColor={color.value}
          tooltip={color.label}
          aria-label={`${color.label} highlight color`}
          tabIndex={index === selectedIndex ? 0 : -1}
          data-highlighted={selectedIndex === index}
        />
      ))}
      <Separator orientation="vertical" />
      <EditorButton
        onClick={handleRemoveHighlight}
        aria-label="Remove highlight"
        tooltip="Remove highlight"
        tabIndex={selectedIndex === colors.length ? 0 : -1}
        type="button"
        role="menuitem">
        <BanIcon className="tiptap-button-icon" />
      </EditorButton>
    </div>
  );
}

function ColorHighlightPopover({
  editor: providedEditor,
  colors = pickHighlightColorsByValue([
    "primary",
    "red",
    "green",
    "blue",
    "yellow",
    "purple",
    "pink",
    "orange",
    "brown",
  ]),
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: ColorHighlightPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = useState(false);
  const { isVisible, canColorHighlight, isActive, label, Icon } =
    useColorHighlight({
      editor,
      hideWhenUnavailable,
      onApplied,
    });

  if (!isVisible) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorHighlightPopoverButton
          disabled={!canColorHighlight}
          aria-pressed={isActive}
          variant={isActive ? "secondary" : "ghost"}
          aria-label={label}
          tooltip={label}
          {...props}>
          <Icon className="tiptap-button-icon" />
        </ColorHighlightPopoverButton>
      </PopoverTrigger>
      <PopoverContent className="py-2 w-fit" aria-label="Highlight colors">
        <ColorHighlightPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  );
}

export {
  ColorHighlightButton,
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
  useColorHighlight,
  canColorHighlight,
  isColorHighlightActive,
  removeHighlight,
};
