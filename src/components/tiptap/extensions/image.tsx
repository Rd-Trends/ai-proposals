import type { NodeViewProps } from "@tiptap/react";
import {
  mergeAttributes,
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Alignment = "left" | "center" | "right";
type ObjectFit = "contain" | "cover" | "fill" | "none" | "scale-down";

export interface ImageNodeOptions {
  /**
   * HTML attributes to add to the image element.
   * @default {}
   */
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    customImage: {
      /**
       * Set a custom image with settings
       */
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string;
        height?: string;
        alignment?: "left" | "center" | "right";
        objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
      }) => ReturnType;
    };
  }
}

/**
 * A custom Tiptap image node with settings and editable caption.
 */
export const CustomImageNode = Node.create<ImageNodeOptions>({
  name: "customImage",

  group: "block",

  draggable: true,

  selectable: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          // Try to get from img tag directly or from figure > img
          const img =
            element.tagName === "IMG" ? element : element.querySelector("img");
          return img?.getAttribute("src") || null;
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => {
          // Try to get from img tag, figcaption, or data attribute
          const img =
            element.tagName === "IMG" ? element : element.querySelector("img");
          const figcaption = element.querySelector("figcaption");
          return figcaption?.textContent || img?.getAttribute("alt") || null;
        },
      },
      title: {
        default: null,
        parseHTML: (element) => {
          const img =
            element.tagName === "IMG" ? element : element.querySelector("img");
          return img?.getAttribute("title") || null;
        },
      },
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-width") || "100%",
      },
      height: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("data-height") || "auto",
      },
      alignment: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-alignment") || "center",
      },
      objectFit: {
        default: "cover",
        parseHTML: (element) =>
          element.getAttribute("data-object-fit") || "cover",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-image"]',
      },
      {
        tag: "figure",
        getAttrs: (element) => {
          // Only parse if it contains an img
          if (typeof element === "string") return false;
          return element.querySelector("img") ? {} : false;
        },
      },
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, width, height, alignment, objectFit } = HTMLAttributes;

    const getAlignmentClass = (align: string) => {
      switch (align) {
        case "left":
          return "items-start";
        case "right":
          return "items-end";
        default:
          return "items-center";
      }
    };

    return [
      "div",
      {
        // Data attributes preserve image settings for re-editing if HTML is pasted back into editor
        "data-type": "custom-image",
        "data-width": width,
        "data-height": height,
        "data-alignment": alignment,
        "data-object-fit": objectFit,
        class: `flex flex-col ${getAlignmentClass(alignment as string)}`,
      },
      [
        "figure",
        { class: "relative m-0" },
        [
          "img",
          mergeAttributes(this.options.HTMLAttributes, {
            src,
            alt: alt || "",
            title: HTMLAttributes.title || alt || "",
            style: `width: ${width}; height: ${height}; object-fit: ${objectFit};`,
            class: "rounded-lg",
          }),
        ],
        alt
          ? [
              "figcaption",
              { class: "mt-2 text-center text-sm text-foreground" },
              alt,
            ]
          : "",
      ],
    ];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNode);
  },
});

interface ImageSettings {
  width: string;
  height: string;
  alignment: Alignment;
  objectFit: ObjectFit;
}

const ImageNode: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const { src, alt, title } = node.attrs;
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(alt || "");
  const [isHovered, setIsHovered] = useState(false);
  const captionInputRef = useRef<HTMLInputElement>(null);

  // Image settings
  const [settings, setSettings] = useState<ImageSettings>({
    width: node.attrs.width || "100%",
    height: node.attrs.height || "auto",
    alignment: node.attrs.alignment || "center",
    objectFit: node.attrs.objectFit || "cover",
  });

  useEffect(() => {
    if (isEditingCaption && captionInputRef.current) {
      captionInputRef.current.focus();
      captionInputRef.current.select();
    }
  }, [isEditingCaption]);

  const handleCaptionClick = () => {
    setIsEditingCaption(true);
  };

  const handleCaptionBlur = () => {
    setIsEditingCaption(false);
    if (captionValue !== alt) {
      updateAttributes({ alt: captionValue, title: captionValue });
    }
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCaptionBlur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setCaptionValue(alt || "");
      setIsEditingCaption(false);
    }
  };

  const handleSettingsChange = (updates: Partial<ImageSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    updateAttributes(newSettings);
  };

  const getAlignmentClass = (alignment: Alignment) => {
    switch (alignment) {
      case "left":
        return "items-start";
      case "right":
        return "items-end";
      case "center":
      default:
        return "items-center";
    }
  };

  return (
    <NodeViewWrapper
      className={`relative group my-6`}
      data-drag-handle
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className={`flex flex-col ${getAlignmentClass(settings.alignment)}`}>
        <figure className="relative m-0">
          <div className="relative inline-block">
            {/** biome-ignore lint/performance/noImgElement: use img element for image node */}
            <img
              src={src}
              alt={alt || ""}
              title={title || ""}
              style={{
                width: settings.width,
                height: settings.height,
                objectFit: settings.objectFit,
              }}
              className={`rounded-lg ${selected ? "ring-2 ring-primary" : ""}`}
            />

            {/* Settings Icon Overlay */}
            {(isHovered || selected) && (
              <div className="absolute top-2 right-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 shadow-lg"
                      onClick={(e) => e.stopPropagation()}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Image Settings</h4>

                      {/* Width Control */}
                      <div className="space-y-2">
                        <label
                          htmlFor="image-width"
                          className="text-sm font-medium">
                          Width
                        </label>
                        <Input
                          id="image-width"
                          type="text"
                          value={settings.width}
                          onChange={(e) =>
                            handleSettingsChange({ width: e.target.value })
                          }
                          placeholder="e.g., 100%, 500px, auto"
                        />
                      </div>

                      {/* Height Control */}
                      <div className="space-y-2">
                        <label
                          htmlFor="image-height"
                          className="text-sm font-medium">
                          Height
                        </label>
                        <Input
                          id="image-height"
                          type="text"
                          value={settings.height}
                          onChange={(e) =>
                            handleSettingsChange({ height: e.target.value })
                          }
                          placeholder="e.g., auto, 300px"
                        />
                      </div>

                      {/* Alignment Control */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Alignment</div>
                        <div className="grid grid-cols-3 gap-2">
                          {(["left", "center", "right"] as Alignment[]).map(
                            (align) => (
                              <Button
                                key={align}
                                size="sm"
                                variant={
                                  settings.alignment === align
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleSettingsChange({ alignment: align })
                                }
                                className="capitalize">
                                {align}
                              </Button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Object Fit Control */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Object Fit</div>
                        <div className="grid grid-cols-2 gap-2">
                          {(
                            [
                              "cover",
                              "contain",
                              "fill",
                              "none",
                              "scale-down",
                            ] as ObjectFit[]
                          ).map((fit) => (
                            <Button
                              key={fit}
                              size="sm"
                              variant={
                                settings.objectFit === fit
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() =>
                                handleSettingsChange({ objectFit: fit })
                              }
                              className="capitalize text-xs">
                              {fit}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Editable Figcaption */}
          <figcaption className="mt-2 text-center">
            {isEditingCaption ? (
              <Input
                ref={captionInputRef}
                type="text"
                value={captionValue}
                onChange={(e) => setCaptionValue(e.target.value)}
                onBlur={handleCaptionBlur}
                onKeyDown={handleCaptionKeyDown}
                className="text-sm text-center"
                placeholder="Add a caption..."
              />
            ) : (
              /* biome-ignore lint/a11y/useKeyWithClickEvents: Caption is editable on click */
              /* biome-ignore lint/a11y/noStaticElementInteractions: Interactive element for editing */
              <span
                onClick={handleCaptionClick}
                className="text-sm text-muted-foreground cursor-text hover:text-foreground transition-colors inline-block px-2 py-1 rounded hover:bg-muted/50">
                {alt || "Click to add caption..."}
              </span>
            )}
          </figcaption>
        </figure>
      </div>
    </NodeViewWrapper>
  );
};
