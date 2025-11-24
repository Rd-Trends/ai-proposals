import TiptapHorizontalRule from "@tiptap/extension-horizontal-rule";
import { mergeAttributes } from "@tiptap/react";
import { editorStyles } from "./editor-style";

export const HorizontalRule = TiptapHorizontalRule.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": this.name,
        class: "my-2 py-3",
      }),
      ["hr", { class: editorStyles.horizontalRule }],
    ];
  },
});

export default HorizontalRule;
