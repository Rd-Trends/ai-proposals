import { TaskItem } from "@tiptap/extension-list";
import type { NodeViewProps } from "@tiptap/react";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { Checkbox } from "@/components/ui/checkbox";

export const CustomTaskItem = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemNode);
  },
});

const TaskItemNode = ({ node, updateAttributes }: NodeViewProps) => {
  const checked = node.attrs.checked as boolean;

  const handleCheckedChange = (newChecked: boolean) => {
    updateAttributes({ checked: newChecked });
  };

  return (
    <NodeViewWrapper
      as="li"
      data-checked={checked}
      className="flex items-start gap-2">
      <div className="pt-1.5">
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="cursor-pointer"
        />
      </div>
      <NodeViewContent
        as="div"
        className={`flex-1 min-w-0 ${checked ? "opacity-50 line-through" : ""}`}
      />
    </NodeViewWrapper>
  );
};
