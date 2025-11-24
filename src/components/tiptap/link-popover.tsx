"use client";

import type { Editor } from "@tiptap/react";
import {
  CornerDownLeft as CornerDownLeftIcon,
  ExternalLink as ExternalLinkIcon,
  Link as LinkIcon,
  Trash2 as TrashIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { EditorButtonProps } from "@/components/tiptap/button";
import { EditorButton } from "@/components/tiptap/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import {
  isMarkInSchema,
  isNodeTypeSelected,
  sanitizeUrl,
} from "@/lib/tiptap-utils";

/**
 * Configuration for the link popover functionality
 */
type UseLinkPopoverConfig = {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether to hide the link popover when not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
};

/**
 * Configuration for the link handler functionality
 */
interface LinkHandlerProps {
  /**
   * The Tiptap editor instance.
   */
  editor: Editor | null;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
}

/**
 * Checks if a link can be set in the current editor state
 */
function canSetLink(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;

  // The third argument 'true' checks whether the current selection is inside an image caption, and prevents setting a link there
  // If the selection is inside an image caption, we can't set a link
  if (isNodeTypeSelected(editor, ["image"], true)) return false;
  return editor.can().setMark("link");
}

/**
 * Checks if a link is currently active in the editor
 */
function isLinkActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive("link");
}

/**
 * Determines if the link button should be shown
 */
function shouldShowLinkButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  const linkInSchema = isMarkInSchema("link", editor);

  if (!linkInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canSetLink(editor);
  }

  return true;
}

/**
 * Validates if a URL is valid and properly formatted
 * Returns normalized URL if valid
 */
function validateUrl(url: string): {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
} {
  if (!url || url.trim() === "") {
    return { isValid: false, error: "URL cannot be empty" };
  }

  const trimmedUrl = url.trim();

  // Check for minimum length
  if (trimmedUrl.length < 1) {
    return { isValid: false, error: "URL is too short" };
  }

  // Check for whitespace
  if (/\s/.test(trimmedUrl)) {
    return { isValid: false, error: "URL cannot contain spaces" };
  }

  // Handle in-app URLs (starting with /)
  if (trimmedUrl.startsWith("/")) {
    // Validate in-app URL format
    if (trimmedUrl.length === 1) {
      return { isValid: true, normalizedUrl: "/" };
    }

    // Check for valid path characters
    if (!/^\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*$/.test(trimmedUrl)) {
      return { isValid: false, error: "Invalid path format" };
    }

    return { isValid: true, normalizedUrl: trimmedUrl };
  }

  // Handle special protocols (mailto, tel)
  if (trimmedUrl.startsWith("mailto:") || trimmedUrl.startsWith("tel:")) {
    const protocol = trimmedUrl.startsWith("mailto:") ? "mailto:" : "tel:";
    const value = trimmedUrl.substring(protocol.length);

    if (!value) {
      return {
        isValid: false,
        error: `${protocol.replace(":", "")} address is required`,
      };
    }

    return { isValid: true, normalizedUrl: trimmedUrl };
  }

  // Handle external URLs - always use https://
  try {
    // Remove http:// if present and replace with https://
    let urlToValidate = trimmedUrl;
    if (urlToValidate.startsWith("http://")) {
      urlToValidate = urlToValidate.replace("http://", "https://");
    }

    // Add https:// if no protocol is present
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(urlToValidate)) {
      urlToValidate = `https://${urlToValidate}`;
    }

    const urlObject = new URL(urlToValidate);

    // Only allow https for web URLs
    if (urlObject.protocol === "http:") {
      urlObject.protocol = "https:";
    }

    if (urlObject.protocol !== "https:") {
      return {
        isValid: false,
        error: "External URLs must use https://",
      };
    }

    // Check for valid hostname
    if (!urlObject.hostname || urlObject.hostname === "") {
      return { isValid: false, error: "Invalid hostname" };
    }

    // Check for localhost or valid domain pattern
    const hostname = urlObject.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local");

    if (!isLocalhost) {
      // Check for at least one dot in the domain (e.g., example.com)
      if (!hostname.includes(".")) {
        return {
          isValid: false,
          error: "Domain must contain at least one dot (e.g., example.com)",
        };
      }

      // Check for valid TLD (at least 2 characters after the last dot)
      const parts = hostname.split(".");
      const tld = parts[parts.length - 1];
      if (tld.length < 2) {
        return { isValid: false, error: "Invalid top-level domain" };
      }
    }

    return { isValid: true, normalizedUrl: urlObject.href };
  } catch {
    return { isValid: false, error: "Invalid URL format" };
  }
}

/**
 * Custom hook for handling link operations in a Tiptap editor
 */
function useLinkHandler(props: LinkHandlerProps) {
  const { editor, onSetLink } = props;
  const [url, setUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!editor) return;

    // Get URL immediately on mount
    const { href } = editor.getAttributes("link");

    if (isLinkActive(editor) && url === null) {
      setUrl(href || "");
    }
  }, [editor, url]);

  useEffect(() => {
    if (!editor) return;

    const updateLinkState = () => {
      const { href } = editor.getAttributes("link");
      setUrl(href || "");
      // Clear validation error when selection changes
      setValidationError(null);
    };

    editor.on("selectionUpdate", updateLinkState);
    return () => {
      editor.off("selectionUpdate", updateLinkState);
    };
  }, [editor]);

  const setLink = useCallback(() => {
    if (!url || !editor) return false;

    // Validate URL before setting
    const validation = validateUrl(url);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid URL");
      return false;
    }

    // Clear any previous validation errors
    setValidationError(null);

    // Use normalized URL from validation
    const finalUrl = validation.normalizedUrl || url;

    const { selection } = editor.state;
    const isEmpty = selection.empty;

    let chain = editor.chain().focus();

    chain = chain.extendMarkRange("link").setLink({ href: finalUrl });

    if (isEmpty) {
      chain = chain.insertContent({ type: "text", text: finalUrl });
    }

    chain.run();

    setUrl(null);

    onSetLink?.();
    return true;
  }, [editor, onSetLink, url]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .unsetLink()
      .setMeta("preventAutolink", true)
      .run();
    setUrl("");
  }, [editor]);

  const openLink = useCallback(
    (target: string = "_blank", features: string = "noopener,noreferrer") => {
      if (!url) return;

      const safeUrl = sanitizeUrl(url, window.location.href);
      if (safeUrl !== "#") {
        window.open(safeUrl, target, features);
      }
    },
    [url]
  );

  return {
    url: url || "",
    setUrl,
    setLink,
    removeLink,
    openLink,
    validationError,
    setValidationError,
  };
}

/**
 * Custom hook for link popover state management
 */
function useLinkState(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}) {
  const { editor, hideWhenUnavailable = false } = props;

  const canSet = canSetLink(editor);
  const isActive = isLinkActive(editor);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowLinkButton({
          editor,
          hideWhenUnavailable,
        })
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  return {
    isVisible,
    canSet,
    isActive,
  };
}

/**
 * Main hook that provides link popover functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MyLinkButton() {
 *   const { isVisible, canSet, isActive, Icon, label } = useLinkPopover()
 *
 *   if (!isVisible) return null
 *
 *   return <button disabled={!canSet}>Link</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedLinkButton() {
 *   const { isVisible, canSet, isActive, Icon, label } = useLinkPopover({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onSetLink: () => console.log('Link set!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       disabled={!canSet}
 *       aria-label={label}
 *       aria-pressed={isActive}
 *     >
 *       <Icon />
 *       {label}
 *     </MyButton>
 *   )
 * }
 * ```
 */
function useLinkPopover(config?: UseLinkPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onSetLink,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);

  const { isVisible, canSet, isActive } = useLinkState({
    editor,
    hideWhenUnavailable,
  });

  const linkHandler = useLinkHandler({
    editor,
    onSetLink,
  });

  return {
    isVisible,
    canSet,
    isActive,
    label: "Link",
    Icon: LinkIcon,
    ...linkHandler,
  };
}

interface LinkMainProps {
  /**
   * The URL to set for the link.
   */
  url: string;
  /**
   * Function to update the URL state.
   */
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  /**
   * Function to set the link in the editor.
   */
  setLink: () => void;
  /**
   * Function to remove the link from the editor.
   */
  removeLink: () => void;
  /**
   * Function to open the link.
   */
  openLink: () => void;
  /**
   * Whether the link is currently active in the editor.
   */
  isActive: boolean;
  /**
   * Validation error message, if any.
   */
  validationError?: string | null;
  /**
   * Function to clear validation error.
   */
  setValidationError?: (error: string | null) => void;
}

interface LinkPopoverProps
  extends Omit<EditorButtonProps, "type">,
    UseLinkPopoverConfig {
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether to automatically open the popover when a link is active.
   * @default true
   */
  autoOpenOnLinkActive?: boolean;
}

/**
 * Link button component for triggering the link popover
 */
const LinkButton = ({ className, children, ...props }: EditorButtonProps) => {
  return (
    <EditorButton
      type="button"
      className={className}
      data-style="ghost"
      tabIndex={-1}
      aria-label="Link"
      tooltip="Link"
      {...props}>
      {children || <LinkIcon className="tiptap-button-icon" />}
    </EditorButton>
  );
};

LinkButton.displayName = "LinkButton";

/**
 * Main content component for the link popover
 */
const LinkMain: React.FC<LinkMainProps> = ({
  url,
  setUrl,
  setLink,
  removeLink,
  openLink,
  isActive,
  validationError,
  setValidationError,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setLink();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear validation error when user types
    if (validationError && setValidationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex flex-row items-center h-fit gap-2">
        <Input
          type="url"
          placeholder="example.com or /about"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className={`flex-1 min-w-0! h-9 pl-2 border-none! outline-none! ring-0! bg-transparent! ${
            validationError ? "text-destructive!" : ""
          }`}
          aria-invalid={!!validationError}
          aria-describedby={validationError ? "link-error" : undefined}
        />

        <div className="flex gap-1 items-center h-6">
          {/* <ButtonGroup orientation="horizontal"> */}
          <EditorButton
            type="button"
            onClick={setLink}
            title="Apply link"
            disabled={!url && !isActive}>
            <CornerDownLeftIcon className="tiptap-button-icon" />
          </EditorButton>
          {/* </ButtonGroup> */}

          <Separator orientation="vertical" />

          {/* <ButtonGroup orientation="horizontal"> */}
          <EditorButton
            type="button"
            onClick={openLink}
            title="Open in new window"
            disabled={!url && !isActive}>
            <ExternalLinkIcon className="tiptap-button-icon" />
          </EditorButton>

          <EditorButton
            type="button"
            onClick={removeLink}
            title="Remove link"
            disabled={!url && !isActive}>
            <TrashIcon className="tiptap-button-icon" />
          </EditorButton>
          {/* </ButtonGroup> */}
        </div>
      </div>

      {validationError && (
        <div
          id="link-error"
          className="text-xs text-destructive px-2 py-1"
          role="alert">
          {validationError}
        </div>
      )}
    </div>
  );
};

/**
 * Link content component for standalone use
 */
const LinkContent: React.FC<{
  editor?: Editor | null;
}> = ({ editor }) => {
  const linkPopover = useLinkPopover({
    editor,
  });

  return <LinkMain {...linkPopover} />;
};

/**
 * Link popover component for Tiptap editors.
 *
 * For custom popover implementations, use the `useLinkPopover` hook instead.
 */
const LinkPopover = ({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onSetLink,
  onOpenChange,
  autoOpenOnLinkActive = true,
  onClick,
  children,
  ...buttonProps
}: LinkPopoverProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = useState(false);

  const {
    isVisible,
    canSet,
    isActive,
    url,
    setUrl,
    setLink,
    removeLink,
    openLink,
    label,
    Icon,
    validationError,
    setValidationError,
  } = useLinkPopover({
    editor,
    hideWhenUnavailable,
    onSetLink,
  });

  const handleOnOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      setIsOpen(nextIsOpen);
      onOpenChange?.(nextIsOpen);
    },
    [onOpenChange]
  );

  const handleSetLink = useCallback(() => {
    const success = setLink();
    // Only close if the link was successfully set
    if (success) {
      setIsOpen(false);
    }
  }, [setLink]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setIsOpen(!isOpen);
    },
    [onClick, isOpen]
  );

  useEffect(() => {
    if (autoOpenOnLinkActive && isActive) {
      setIsOpen(true);
    }
  }, [autoOpenOnLinkActive, isActive]);

  if (!isVisible) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
      <PopoverTrigger asChild>
        <LinkButton
          disabled={!canSet}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canSet}
          aria-label={label}
          aria-pressed={isActive}
          onClick={handleClick}
          {...buttonProps}>
          {children ?? <Icon className="tiptap-button-icon" />}
        </LinkButton>
      </PopoverTrigger>

      <PopoverContent className="p-1 w-full md:max-w-md">
        <LinkMain
          url={url}
          setUrl={setUrl}
          setLink={handleSetLink}
          removeLink={removeLink}
          openLink={openLink}
          isActive={isActive}
          validationError={validationError}
          setValidationError={setValidationError}
        />
      </PopoverContent>
    </Popover>
  );
};

export {
  LinkPopover,
  LinkContent,
  LinkButton,
  useLinkPopover,
  canSetLink,
  isLinkActive,
};
