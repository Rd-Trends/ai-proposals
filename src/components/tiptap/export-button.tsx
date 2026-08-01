import { type Editor } from "@tiptap/react";
import { CloudDownload } from "lucide-react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { exportToDocx } from "@/hooks/use-tiptap-export";
import EditorButton, { EditorButtonProps } from "./button";

const ExportButton = ({
  editor: providedEditor,
  onClick,
  children,
  ...buttonProps
}: EditorButtonProps & {
  editor?: Editor | null;
}) => {
  const { editor } = useTiptapEditor(providedEditor);
  //   const { handleExport } = useTipTapExport(editor);

  const handleExport = async () => {
    if (!editor) return;
    const json = editor.getJSON();

    // Uses research preset by default (Times New Roman, 12pt, double-spaced)
    await exportToDocx(json, "research-paper.docx", {
      preset: "apa",
      title: "My Research Paper",
      creator: "John Doe",
    });
  };

  return (
    <EditorButton
      aria-label={"Export to DOCX"}
      disabled={!editor}
      onClick={handleExport}
      tooltip="Export to DOCX"
      {...buttonProps}
    >
      {children ?? (
        <>
          <CloudDownload />
        </>
      )}
    </EditorButton>
  );
};

export { ExportButton };
