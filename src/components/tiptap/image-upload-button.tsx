"use client";

import type { Editor } from "@tiptap/react";
import { ImagePlus as ImagePlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { EditorButtonProps } from "@/components/tiptap/button";
import { EditorButton } from "@/components/tiptap/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { isExtensionAvailable, parseShortcutKeys } from "@/lib/tiptap-utils";

const IMAGE_UPLOAD_SHORTCUT_KEY = "mod+shift+i";

/**
 * Configuration for the image upload functionality
 */
type UseImageUploadConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the button should hide when insertion is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful image insertion.
   */
  onInserted?: () => void;
};

/**
 * Checks if image can be inserted in the current editor state
 */
function canInsertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, "imageUpload")) return false;

  return editor.can().insertContent({ type: "imageUpload" });
}

/**
 * Checks if image is currently active
 */
function isImageActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive("imageUpload");
}

/**
 * Inserts an image in the editor
 */
function insertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canInsertImage(editor)) return false;

  try {
    return editor
      .chain()
      .focus()
      .insertContent({
        type: "imageUpload",
      })
      .run();
  } catch {
    return false;
  }
}

/**
 * Determines if the image button should be shown
 */
function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, "imageUpload")) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canInsertImage(editor);
  }

  return true;
}

/**
 * Custom hook that provides image functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage - no params needed
 * function MySimpleImageButton() {
 *   const { isVisible, handleImage } = useImage()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleImage}>Add Image</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedImageButton() {
 *   const { isVisible, handleImage, label, isActive } = useImage({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onInserted: () => console.log('Image inserted!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleImage}
 *       aria-pressed={isActive}
 *       aria-label={label}
 *     >
 *       Add Image
 *     </MyButton>
 *   )
 * }
 * ```
 */
function useImageUpload(config?: UseImageUploadConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onInserted,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canInsert = canInsertImage(editor);
  const isActive = isImageActive(editor);

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

  const handleImage = useCallback(() => {
    if (!editor) return false;

    const success = insertImage(editor);
    if (success) {
      onInserted?.();
    }
    return success;
  }, [editor, onInserted]);

  useHotkeys(
    IMAGE_UPLOAD_SHORTCUT_KEY,
    (event) => {
      event.preventDefault();
      handleImage();
    },
    {
      enabled: isVisible && canInsert,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  );

  return {
    isVisible,
    isActive,
    handleImage,
    canInsert,
    label: "Add image",
    shortcutKeys: IMAGE_UPLOAD_SHORTCUT_KEY,
    Icon: ImagePlusIcon,
  };
}

type IconProps = React.SVGProps<SVGSVGElement>;
type IconComponent = ({ className, ...props }: IconProps) => React.ReactElement;

type ImageUploadButtonProps = Omit<EditorButtonProps, "type"> &
  UseImageUploadConfig & {
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

/**
 * Button component for uploading/inserting images in a Tiptap editor.
 *
 * For custom button implementations, use the `useImage` hook instead.
 */
const ImageUploadButton = ({
  editor: providedEditor,
  text,
  hideWhenUnavailable = false,
  onInserted,
  showShortcut = false,
  onClick,
  icon: CustomIcon,
  children,
  ...buttonProps
}: ImageUploadButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const {
    isVisible,
    canInsert,
    handleImage,
    label,
    isActive,
    shortcutKeys,
    Icon,
  } = useImageUpload({
    editor,
    hideWhenUnavailable,
    onInserted,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      handleImage();
    },
    [handleImage, onClick]
  );

  if (!isVisible) {
    return null;
  }

  const RenderIcon = CustomIcon ?? Icon;

  return (
    <EditorButton
      type="button"
      isActive={isActive}
      tabIndex={-1}
      disabled={!canInsert}
      data-disabled={!canInsert}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      onClick={handleClick}
      className="w-fit px-2"
      {...buttonProps}>
      {children ?? (
        <>
          <RenderIcon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>}
        </>
      )}
    </EditorButton>
  );
};

export {
  ImageUploadButton,
  useImageUpload,
  canInsertImage,
  isImageActive,
  insertImage,
};
