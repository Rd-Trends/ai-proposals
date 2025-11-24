"use client";

import type { NodeType } from "@tiptap/pm/model";
import type { NodeViewProps } from "@tiptap/react";
import {
  mergeAttributes,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  Node as TipTapNode,
} from "@tiptap/react";
import { CloudUpload, File, Link as LinkIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import EditorButton from "@/components/tiptap/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { focusNextNode, isValidPosition } from "@/lib/tiptap-utils";

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>;

export interface ImageUploadNodeOptions {
  /**
   * The type of the node.
   * @default 'customImage'
   */
  type?: string | NodeType | undefined;
  /**
   * Acceptable file types for upload.
   * @default 'image/*'
   */
  accept?: string;
  /**
   * Maximum number of files that can be uploaded.
   * @default 1
   */
  limit?: number;
  /**
   * Maximum file size in bytes (0 for unlimited).
   * @default 0
   */
  maxSize?: number;
  /**
   * Modes to enable for image insertion.
   * @default ['upload', 'url']
   * @example ['upload'] - Only file upload
   * @example ['url'] - Only URL input
   * @example ['upload', 'url'] - Both options with tabs
   */
  modes?: Array<"upload" | "url">;
  /**
   * Function to handle the upload process.
   */
  upload?: UploadFunction;
  /**
   * Callback for upload errors.
   */
  onError?: (error: Error) => void;
  /**
   * Callback for successful uploads.
   */
  onSuccess?: (url: string) => void;
  /**
   * HTML attributes to add to the image element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: React.HTMLAttributes<HTMLElement>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUploadNode: (options?: ImageUploadNodeOptions) => ReturnType;
    };
  }
}

/**
 * A Tiptap node extension that creates an image upload component.
 * @see registry/tiptap-node/image-upload-node/image-upload-node
 */
export const ImageUploadNode = TipTapNode.create<ImageUploadNodeOptions>({
  name: "imageUpload",

  group: "block",

  draggable: true,

  selectable: true,

  atom: true,

  addOptions() {
    return {
      type: "customImage",
      accept: "image/*",
      limit: 1,
      maxSize: 0,
      modes: ["upload", "url"] as Array<"upload" | "url">,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      accept: {
        default: this.options.accept,
      },
      limit: {
        default: this.options.limit,
      },
      maxSize: {
        default: this.options.maxSize,
      },
      modes: {
        default: this.options.modes,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "image-upload" }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUpload);
  },

  addCommands() {
    return {
      setImageUploadNode:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  /**
   * Adds Enter key handler to trigger the upload component when it's selected.
   */
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        const { nodeAfter } = selection.$from;

        if (
          nodeAfter &&
          nodeAfter.type.name === "imageUpload" &&
          editor.isActive("imageUpload")
        ) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos);
          if (nodeEl && nodeEl instanceof HTMLElement) {
            // Since NodeViewWrapper is wrapped with a div, we need to click the first child
            const firstChild = nodeEl.firstChild;
            if (firstChild && firstChild instanceof HTMLElement) {
              firstChild.click();
              return true;
            }
          }
        }
        return false;
      },
    };
  },
});

// Validation constants
const MAX_ALT_TEXT_LENGTH = 125;
const URL_REGEX = /^https?:\/\/.+\..+/i;

export interface FileItem {
  /**
   * Unique identifier for the file item
   */
  id: string;
  /**
   * The actual File object being uploaded
   */
  file: File;
  /**
   * Current upload progress as a percentage (0-100)
   */
  progress: number;
  /**
   * Current status of the file upload process
   * @default "uploading"
   */
  status: "uploading" | "success" | "error";

  /**
   * URL to the uploaded file, available after successful upload
   * @optional
   */
  url?: string;
  /**
   * Controller that can be used to abort the upload process
   * @optional
   */
  abortController?: AbortController;
}

export interface UploadOptions {
  /**
   * Maximum allowed file size in bytes
   */
  maxSize: number;
  /**
   * Maximum number of files that can be uploaded
   */
  limit: number;
  /**
   * String specifying acceptable file types (MIME types or extensions)
   * @example ".jpg,.png,image/jpeg" or "image/*"
   */
  accept: string;
  /**
   * Function that handles the actual file upload process
   * @param {File} file - The file to be uploaded
   * @param {Function} onProgress - Callback function to report upload progress
   * @param {AbortSignal} signal - Signal that can be used to abort the upload
   * @returns {Promise<string>} Promise resolving to the URL of the uploaded file
   */
  upload: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    signal: AbortSignal
  ) => Promise<string>;
  /**
   * Callback triggered when a file is uploaded successfully
   * @param {string} url - URL of the successfully uploaded file
   * @optional
   */
  onSuccess?: (url: string) => void;
  /**
   * Callback triggered when an error occurs during upload
   * @param {Error} error - The error that occurred
   * @optional
   */
  onError?: (error: Error) => void;
}

/**
 * Custom hook for managing multiple file uploads with progress tracking and cancellation
 */
function useFileUpload(options: UploadOptions) {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > options.maxSize) {
      const error = new Error(
        `File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`
      );
      options.onError?.(error);
      return null;
    }

    const abortController = new AbortController();
    const fileId = crypto.randomUUID();

    const newFileItem: FileItem = {
      id: fileId,
      file,
      progress: 0,
      status: "uploading",
      abortController,
    };

    setFileItems((prev) => [...prev, newFileItem]);

    try {
      if (!options.upload) {
        throw new Error("Upload function is not defined");
      }

      const url = await options.upload(
        file,
        (event: { progress: number }) => {
          setFileItems((prev) =>
            prev.map((item) =>
              item.id === fileId ? { ...item, progress: event.progress } : item
            )
          );
        },
        abortController.signal
      );

      if (!url) throw new Error("Upload failed: No URL returned");

      if (!abortController.signal.aborted) {
        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "success", url, progress: 100 }
              : item
          )
        );
        options.onSuccess?.(url);
        return url;
      }

      return null;
    } catch (error) {
      if (!abortController.signal.aborted) {
        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "error", progress: 0 }
              : item
          )
        );
        options.onError?.(
          error instanceof Error ? error : new Error("Upload failed")
        );
      }
      return null;
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) {
      options.onError?.(new Error("No files to upload"));
      return [];
    }

    if (options.limit && files.length > options.limit) {
      options.onError?.(
        new Error(
          `Maximum ${options.limit} file${
            options.limit === 1 ? "" : "s"
          } allowed`
        )
      );
      return [];
    }

    // Upload all files concurrently
    const uploadPromises = files.map((file) => uploadFile(file));
    const results = await Promise.all(uploadPromises);

    // Filter out null results (failed uploads)
    return results.filter((url): url is string => url !== null);
  };

  const removeFileItem = (fileId: string) => {
    setFileItems((prev) => {
      const fileToRemove = prev.find((item) => item.id === fileId);
      if (fileToRemove?.abortController) {
        fileToRemove.abortController.abort();
      }
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter((item) => item.id !== fileId);
    });
  };

  const clearAllFiles = () => {
    fileItems.forEach((item) => {
      if (item.abortController) {
        item.abortController.abort();
      }
      if (item.url) {
        URL.revokeObjectURL(item.url);
      }
    });
    setFileItems([]);
  };

  return {
    fileItems,
    uploadFiles,
    removeFileItem,
    clearAllFiles,
  };
}

interface ImageUploadDragAreaProps {
  /**
   * Callback function triggered when files are dropped or selected
   * @param {File[]} files - Array of File objects that were dropped or selected
   */
  onFile: (files: File[]) => void;
  /**
   * Optional child elements to render inside the drag area
   * @optional
   * @default undefined
   */
  children?: React.ReactNode;
}

/**
 * A component that creates a drag-and-drop area for image uploads
 */
const ImageUploadDragArea: React.FC<ImageUploadDragAreaProps> = ({
  onFile,
  children,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false);
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFile(files);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <div with drag-and-drop handlers
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-gray-300 hover:border-gray-400"
      } ${isDragOver ? "bg-primary/10" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      {children}
    </div>
  );
};

interface ImageUploadPreviewProps {
  /**
   * The file item to preview
   */
  fileItem: FileItem;
  /**
   * Callback to remove this file from upload queue
   */
  onRemove: () => void;
}

/**
 * Component that displays a preview of an uploading file with progress
 */
const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  fileItem,
  onRemove,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="relative border rounded-lg overflow-hidden bg-background">
      {fileItem.status === "uploading" && (
        <div
          className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300"
          style={{ width: `${fileItem.progress}%` }}
        />
      )}

      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CloudUpload className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-foreground truncate">
              {fileItem.file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(fileItem.file.size)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fileItem.status === "uploading" && (
            <span className="text-sm font-medium text-primary">
              {fileItem.progress}%
            </span>
          )}
          <EditorButton
            type="button"
            data-style="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}>
            <X className="w-4 h-4" />
          </EditorButton>
        </div>
      </div>
    </div>
  );
};

const DropZoneContent: React.FC<{ maxSize: number; limit: number }> = ({
  maxSize,
  limit,
}) => (
  <div className="flex flex-col items-center justify-center gap-4 py-8">
    <div className="relative w-14 h-16">
      <File className="w-14 h-16 text-gray-200" />
      <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-xl flex items-center justify-center">
        <CloudUpload className="w-3.5 h-3.5 text-primary-foreground" />
      </div>
    </div>

    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-sm font-medium text-foreground">
        <em className="not-italic underline">Click to upload</em> or drag and
        drop
      </span>
      <span className="text-xs font-semibold text-muted-foreground">
        Maximum {limit} file{limit === 1 ? "" : "s"}, {maxSize / 1024 / 1024}MB
        each.
      </span>
    </div>
  </div>
);

// Validation helper functions
const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url.trim()) {
    return { isValid: false, error: "Image URL is required" };
  }

  if (!URL_REGEX.test(url.trim())) {
    return {
      isValid: false,
      error: "Please enter a valid URL (must start with http:// or https://)",
    };
  }

  return { isValid: true };
};

const validateAltText = (
  text: string
): { isValid: boolean; error?: string } => {
  if (text.length > MAX_ALT_TEXT_LENGTH) {
    return {
      isValid: false,
      error: `Alt text must be ${MAX_ALT_TEXT_LENGTH} characters or less`,
    };
  }

  return { isValid: true };
};

interface ImageUploadTabProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  limit: number;
  maxSize: number;
  fileItems: FileItem[];
  hasFiles: boolean;
  onUpload: (files: File[]) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
}

const ImageUploadTab: React.FC<ImageUploadTabProps> = ({
  inputRef,
  accept,
  limit,
  maxSize,
  fileItems,
  hasFiles,
  onUpload,
  onChange,
  onClick,
  onRemoveFile,
  onClearAll,
}) => (
  <>
    {/* biome-ignore lint/a11y/noStaticElementInteractions: Interactive upload area with hidden file input */}
    <div
      className="cursor-pointer"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}>
      {!hasFiles && (
        <ImageUploadDragArea onFile={onUpload}>
          <DropZoneContent maxSize={maxSize} limit={limit} />
        </ImageUploadDragArea>
      )}

      {hasFiles && (
        <div className="space-y-4">
          {fileItems.length > 1 && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                Uploading {fileItems.length} files
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearAll();
                }}>
                Clear All
              </Button>
            </div>
          )}
          <div className="space-y-2">
            {fileItems.map((fileItem) => (
              <ImageUploadPreview
                key={fileItem.id}
                fileItem={fileItem}
                onRemove={() => onRemoveFile(fileItem.id)}
              />
            ))}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        name="file"
        accept={accept}
        type="file"
        multiple={limit > 1}
        onChange={onChange}
        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
        className="hidden"
      />
    </div>
  </>
);

interface ImageUrlTabProps {
  imageUrl: string;
  altText: string;
  urlError: string;
  altTextError: string;
  onImageUrlChange: (value: string) => void;
  onAltTextChange: (value: string) => void;
  onSubmit: () => void;
}

const ImageUrlTab: React.FC<ImageUrlTabProps> = ({
  imageUrl,
  altText,
  urlError,
  altTextError,
  onImageUrlChange,
  onAltTextChange,
  onSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-6 space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Insert image from URL
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Enter the URL and caption for your image
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="image-url"
              className="text-sm font-medium text-foreground block mb-1.5">
              Image URL <span className="text-destructive">*</span>
            </label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => onImageUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full ${urlError ? "border-destructive" : ""}`}
            />
            {urlError && (
              <p className="text-xs text-destructive mt-1.5">{urlError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="alt-text"
              className="text-sm font-medium text-foreground block mb-1.5">
              Alt Text / Caption
              <span className="text-xs text-muted-foreground ml-2">
                ({altText.length}/{MAX_ALT_TEXT_LENGTH})
              </span>
            </label>
            <Input
              id="alt-text"
              type="text"
              placeholder="Describe the image"
              value={altText}
              onChange={(e) => onAltTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full ${altTextError ? "border-destructive" : ""}`}
              maxLength={MAX_ALT_TEXT_LENGTH}
            />
            {altTextError && (
              <p className="text-xs text-destructive mt-1.5">{altTextError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1.5">
              Provide a brief description for accessibility
            </p>
          </div>
        </div>

        <Button type="button" onClick={onSubmit} className="w-full">
          Insert Image
        </Button>
      </div>
    </div>
  );
};

const ImageUpload = (props: NodeViewProps) => {
  const {
    accept,
    limit,
    maxSize,
    modes = ["upload", "url"],
  } = props.node.attrs;
  const inputRef = useRef<HTMLInputElement>(null);
  const extension = props.extension;

  // State for URL tab
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [urlError, setUrlError] = useState("");
  const [altTextError, setAltTextError] = useState("");

  // Determine available modes
  const availableModes = modes as Array<"upload" | "url">;
  const hasUpload = availableModes.includes("upload");
  const hasUrl = availableModes.includes("url");
  const showTabs = hasUpload && hasUrl;

  const uploadOptions: UploadOptions = {
    maxSize,
    limit,
    accept,
    upload: extension.options.upload,
    onSuccess: extension.options.onSuccess,
    onError: extension.options.onError,
  };

  const { fileItems, uploadFiles, removeFileItem, clearAllFiles } =
    useFileUpload(uploadOptions);

  const handleUpload = async (files: File[]) => {
    const urls = await uploadFiles(files);

    if (urls.length > 0) {
      const pos = props.getPos();

      if (isValidPosition(pos)) {
        const imageNodes = urls.map((url, index) => {
          const filename =
            files[index]?.name.replace(/\.[^/.]+$/, "") || "unknown";
          return {
            type: extension.options.type,
            attrs: {
              ...extension.options,
              src: url,
              alt: filename,
              title: filename,
            },
          };
        });

        props.editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + props.node.nodeSize })
          .insertContentAt(pos, imageNodes)
          .run();

        focusNextNode(props.editor);
      }
    }
  };

  const handleUrlSubmit = () => {
    // Reset errors
    setUrlError("");
    setAltTextError("");

    // Validate URL
    const urlValidation = validateUrl(imageUrl);
    if (!urlValidation.isValid) {
      setUrlError(urlValidation.error || "Invalid URL");
      return;
    }

    // Validate alt text
    const altTextValidation = validateAltText(altText);
    if (!altTextValidation.isValid) {
      setAltTextError(altTextValidation.error || "Invalid alt text");
      return;
    }

    const pos = props.getPos();

    if (isValidPosition(pos)) {
      const imageNode = {
        type: extension.options.type,
        attrs: {
          ...extension.options,
          src: imageUrl.trim(),
          alt: altText.trim() || "Image",
          title: altText.trim() || "Image",
        },
      };

      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + props.node.nodeSize })
        .insertContentAt(pos, imageNode)
        .run();

      focusNextNode(props.editor);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      extension.options.onError?.(new Error("No file selected"));
      return;
    }
    handleUpload(Array.from(files));
  };

  const handleClick = () => {
    if (inputRef.current && fileItems.length === 0) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const hasFiles = fileItems.length > 0;

  // Handler for image URL input changes with validation
  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    if (urlError) setUrlError(""); // Clear error on change
  };

  // Handler for alt text input changes with validation
  const handleAltTextChange = (value: string) => {
    setAltText(value);
    if (altTextError) setAltTextError(""); // Clear error on change
  };

  return (
    <NodeViewWrapper className="my-8" tabIndex={0}>
      <div className="max-w-2xl mx-auto">
        {showTabs ? (
          <Tabs defaultValue={hasUpload ? "upload" : "url"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {hasUpload && (
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
              )}
              {hasUrl && <TabsTrigger value="url">Image URL</TabsTrigger>}
            </TabsList>

            {hasUpload && (
              <TabsContent value="upload" className="mt-4">
                <ImageUploadTab
                  inputRef={inputRef}
                  accept={accept}
                  limit={limit}
                  maxSize={maxSize}
                  fileItems={fileItems}
                  hasFiles={hasFiles}
                  onUpload={handleUpload}
                  onChange={handleChange}
                  onClick={handleClick}
                  onRemoveFile={removeFileItem}
                  onClearAll={clearAllFiles}
                />
              </TabsContent>
            )}

            {hasUrl && (
              <TabsContent value="url" className="mt-4">
                <ImageUrlTab
                  imageUrl={imageUrl}
                  altText={altText}
                  urlError={urlError}
                  altTextError={altTextError}
                  onImageUrlChange={handleImageUrlChange}
                  onAltTextChange={handleAltTextChange}
                  onSubmit={handleUrlSubmit}
                />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <>
            {hasUpload && (
              <ImageUploadTab
                inputRef={inputRef}
                accept={accept}
                limit={limit}
                maxSize={maxSize}
                fileItems={fileItems}
                hasFiles={hasFiles}
                onUpload={handleUpload}
                onChange={handleChange}
                onClick={handleClick}
                onRemoveFile={removeFileItem}
                onClearAll={clearAllFiles}
              />
            )}

            {hasUrl && (
              <ImageUrlTab
                imageUrl={imageUrl}
                altText={altText}
                urlError={urlError}
                altTextError={altTextError}
                onImageUrlChange={handleImageUrlChange}
                onAltTextChange={handleAltTextChange}
                onSubmit={handleUrlSubmit}
              />
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
