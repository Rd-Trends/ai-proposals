import Heading from "@tiptap/extension-heading";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import { editorStyles } from "./editor-style";

export const ModStarterKit = StarterKit.extend({
  extendNodeSchema(extension) {
    if (extension.name === "heading") {
      extension.configure({
        levels: [1, 2, 3, 4, 5, 6],
      });
    }
  },
});

export const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      level: {
        default: 1,
        rendered: false,
      },
    };
  },

  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: ProseMirrorNode;
    HTMLAttributes: Record<string, string>;
  }) {
    const level = node.attrs.level as 1 | 2 | 3 | 4 | 5 | 6;
    const classNameMap = {
      1: editorStyles.heading[1],
      2: editorStyles.heading[2],
      3: editorStyles.heading[3],
      4: editorStyles.heading[4],
      5: editorStyles.heading[5],
      6: editorStyles.heading[6],
    };

    return [
      `h${level}`,
      {
        ...HTMLAttributes,
        class: classNameMap[level],
      },
      0,
    ];
  },
});
