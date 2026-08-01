import {
  Mark,
  MarkViewProps,
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
  ReactMarkViewRenderer,
  ReactNodeViewRenderer,
  Node as TipTapNode,
} from "@tiptap/react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChangeIndicatorOptions {
  onChangeAccepted?: () => void;
  onChangeRejected?: () => void;
  HTMLAttributes: React.HTMLAttributes<HTMLElement>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    changeIndicator: {
      setChangeIndicator: (options: ChangeIndicatorOptions) => ReturnType;
    };
  }
}

// INLINE CHANGE - using Mark for inline text changes
export const InlineChangeMark = Mark.create({
  name: "inlineChange",

  addAttributes() {
    return {
      oldText: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-old"),
        renderHTML: (attributes) => ({
          "data-old": attributes.oldText,
        }),
      },
      newText: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-new"),
        renderHTML: (attributes) => ({
          "data-new": attributes.newText,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-inline-change]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        "data-inline-change": "",
        ...HTMLAttributes,
        class:
          "bg-blue-100 px-1 rounded relative inline-flex items-center gap-1",
      },
      0,
    ];
  },

  addMarkView() {
    return ReactMarkViewRenderer(InlineChangeComponent);
  },
});

// Component for inline changes
const InlineChangeComponent = ({ mark, editor }: MarkViewProps) => {
  const oldText = mark.attrs.oldText;
  const newText = mark.attrs.newText;

  return (
    <>
      <span className="bg-red-500/50">{oldText}</span>
      <span className="bg-green-500/50">{newText}</span>
    </>
  );
};

// BLOCK CHANGE - Node for accepted items (block level)
export const AcceptedItemNode = TipTapNode.create({
  name: "acceptedItem",
  group: "changeItem",
  content: "block+",
  selectable: false,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: "div[data-accepted-item]",
        priority: 51,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-accepted-item": "", ...HTMLAttributes }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AcceptedItem);
  },
});

// Node for rejected items (block level)
export const RejectedItemNode = TipTapNode.create({
  name: "rejectedItem",
  group: "changeItem",
  content: "block+",
  selectable: false,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: "div[data-rejected-item]",
        priority: 51,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-rejected-item": "", ...HTMLAttributes }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RejectedItem);
  },
});

// Main change indicator wrapper (block level)
export const ChangeIndicatorNode = TipTapNode.create<ChangeIndicatorOptions>({
  name: "changeIndicator",
  group: "block",
  content: "rejectedItem acceptedItem",
  selectable: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-change-indicator]",
        priority: 52,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-change-indicator": "", ...HTMLAttributes }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChangeIndicator);
  },

  addCommands() {
    return {
      setChangeIndicator:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Component for accepted item (block)
const AcceptedItem = ({ node }: NodeViewProps) => {
  return (
    <NodeViewWrapper
      as="div"
      className="bg-green-50 border-l-4 border-green-500 pl-3 py-2 my-1"
      data-accepted-item
    >
      <NodeViewContent />
    </NodeViewWrapper>
  );
};

// Component for rejected item (block)
const RejectedItem = ({ node }: NodeViewProps) => {
  return (
    <NodeViewWrapper
      as="div"
      className="bg-red-50 border-l-4 border-red-500 pl-3 py-2 my-1 line-through opacity-60"
      data-rejected-item
    >
      <NodeViewContent />
    </NodeViewWrapper>
  );
};

// Main change indicator component (block)
const ChangeIndicator = ({ node, editor, getPos }: NodeViewProps) => {
  const handleAcceptChange = () => {
    const pos = getPos();
    if (typeof pos !== "number") return;

    editor
      .chain()
      .focus()
      .command(({ tr, dispatch }) => {
        if (!dispatch) return false;

        const nodeSize = node.nodeSize;
        const from = pos;
        const to = pos + nodeSize;

        let acceptedContent = null;
        node.content.forEach((child) => {
          if (child.type.name === "acceptedItem") {
            acceptedContent = child.content;
          }
        });

        if (!acceptedContent) return false;

        tr.delete(from, to);
        tr.insert(from, acceptedContent);

        return true;
      })
      .run();

    editor.options.extensions
      .find((ext) => ext.name === "changeIndicator")
      ?.options?.onChangeAccepted?.();
  };

  const handleRejectChange = () => {
    const pos = getPos();
    if (typeof pos !== "number") return;

    editor
      .chain()
      .focus()
      .command(({ tr, dispatch }) => {
        if (!dispatch) return false;

        const nodeSize = node.nodeSize;
        const from = pos;
        const to = pos + nodeSize;

        let rejectedContent = null;
        node.content.forEach((child) => {
          if (child.type.name === "rejectedItem") {
            rejectedContent = child.content;
          }
        });

        if (!rejectedContent) return false;

        tr.delete(from, to);
        tr.insert(from, rejectedContent);

        return true;
      })
      .run();

    editor.options.extensions
      .find((ext) => ext.name === "changeIndicator")
      ?.options?.onChangeRejected?.();
  };

  return (
    <NodeViewWrapper
      as="div"
      className="relative border-2 border-dashed border-blue-300 rounded p-2 my-2"
      data-change-indicator
    >
      <NodeViewContent />

      <div className="absolute -top-3 -right-3 flex gap-1 bg-white rounded shadow-md border p-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-7 w-7 hover:bg-red-100 hover:text-red-600"
              onClick={handleRejectChange}
              size="icon"
              variant="ghost"
            >
              <RotateCcw className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Keep Rejected Version</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-7 w-7 hover:bg-green-100 hover:text-green-600"
              onClick={handleAcceptChange}
              size="icon"
              variant="ghost"
            >
              <Check className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Keep Accepted Version</TooltipContent>
        </Tooltip>
      </div>
    </NodeViewWrapper>
  );
};
