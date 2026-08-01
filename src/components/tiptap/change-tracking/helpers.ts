// utils/changeTracking.ts
import { type Editor } from "@tiptap/core";

export interface Change {
  from: number;
  to: number;
  oldText: string;
  newText: string;
}

export function findAllChanges(editor: Editor): Change[] {
  const changes: Change[] = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.marks.length > 0) {
      node.marks.forEach((mark) => {
        if (mark.type.name === "inlineChange") {
          changes.push({
            from: pos,
            to: pos + node.nodeSize,
            oldText: mark.attrs.oldText,
            newText: mark.attrs.newText,
          });
        }
      });
    }
  });

  return changes.sort((a, b) => a.from - b.from);
}

export function acceptChange(editor: Editor, change: Change) {
  const { from, to } = change;

  let nextChangePos = to;

  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.replaceWith(from, to, editor.state.schema.text(change.newText));

      // Find the next change after this one
      const allChanges = findAllChanges(editor);
      const currentIndex = allChanges.findIndex(
        (c) => c.from === from && c.to === to
      );

      if (currentIndex !== -1 && allChanges.length > 1) {
        // check if it can move forward
        if (currentIndex + 1 < allChanges.length) {
          nextChangePos = allChanges[currentIndex + 1].from;
        } else if (currentIndex - 1 >= 0) {
          // else move backward
          nextChangePos = allChanges[0].from;
        }
      }

      return true;
    })
    .setTextSelection(nextChangePos)
    .scrollIntoView()
    .run();
}

export function rejectChange(editor: Editor, change: Change) {
  const { from, to, oldText } = change;

  let nextChangePos = to;

  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.replaceWith(from, to, editor.state.schema.text(oldText));

      // Find the next change after this one
      const allChanges = findAllChanges(editor);
      const currentIndex = allChanges.findIndex(
        (c) => c.from === from && c.to === to
      );

      if (currentIndex !== -1 && allChanges.length > 1) {
        // check if it can move forward
        if (currentIndex + 1 < allChanges.length) {
          nextChangePos = allChanges[currentIndex + 1].from;
        } else if (currentIndex - 1 >= 0) {
          nextChangePos = allChanges[0].from;
        }
      }

      return true;
    })
    .setTextSelection(nextChangePos)
    .scrollIntoView()
    .run();
}

export function acceptAllChanges(editor: Editor) {
  const changes = findAllChanges(editor);

  if (changes.length === 0) return;
  let lastMappedPos = changes[changes.length - 1].to;

  editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      // Track position changes as we modify the document

      changes.forEach((change) => {
        // Map positions through all previous changes in this transaction
        const from = tr.mapping.map(change.from);
        const to = tr.mapping.map(change.to);

        tr.replaceWith(from, to, state.schema.text(change.newText));

        // Update the last position for cursor placement
        lastMappedPos = tr.mapping.map(changes[changes.length - 1].to);
      });

      return true;
    })
    .setTextSelection(lastMappedPos)
    .run();
}

export function rejectAllChanges(editor: Editor) {
  const changes = findAllChanges(editor);

  if (changes.length === 0) return;

  let lastMappedPos = changes[changes.length - 1].to;

  editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      // Track position changes as we modify the document

      changes.forEach((change) => {
        // Map positions through all previous changes in this transaction
        const from = tr.mapping.map(change.from);
        const to = tr.mapping.map(change.to);

        tr.replaceWith(from, to, state.schema.text(change.oldText));

        // Update the last position for cursor placement
        lastMappedPos = tr.mapping.map(changes[changes.length - 1].to);
      });

      return true;
    })
    .setTextSelection(lastMappedPos)
    .run();
}
