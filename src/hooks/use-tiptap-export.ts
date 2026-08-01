"use client";

import {
  AlignmentType,
  convertInchesToTwip,
  Document,
  HeadingLevel,
  IPropertiesOptions,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

/**
 * Configuration options for DOCX export
 *
 */

type ValueOf<T> = T[keyof T];
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type DocxExportSettings = {
  // Document settings
  title?: string;
  subject?: string;
  creator?: string;
  description?: string;

  // Page settings
  pageMargins?: {
    top: number; // in inches
    right: number;
    bottom: number;
    left: number;
  };

  // Typography settings
  fontFamily?: string;
  fontSize?: number; // in points (e.g., 12)
  lineSpacing?: number; // line spacing multiplier (e.g., 1.5, 2.0)
  paragraphSpacing?: {
    before: number; // in points
    after: number; // in points
  };

  // Heading settings
  headingFontFamily?: string;
  headingSizes?: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };

  // Style presets
  preset?: "research" | "apa" | "mla" | "chicago" | "custom";
};

/**
 * Default research paper settings (similar to APA/academic standards)
 */
const RESEARCH_PRESET: Required<
  Omit<
    DocxExportSettings,
    "preset" | "title" | "subject" | "creator" | "description"
  >
> = {
  pageMargins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  },
  fontFamily: "Times New Roman",
  fontSize: 12,
  lineSpacing: 2.0, // Double spacing
  paragraphSpacing: {
    before: 0,
    after: 0,
  },
  headingFontFamily: "Times New Roman",
  headingSizes: {
    h1: 14,
    h2: 13,
    h3: 12,
    h4: 12,
    h5: 12,
    h6: 12,
  },
};

/**
 * APA 7th Edition preset
 */
const APA_PRESET: Required<
  Required<
    Omit<
      DocxExportSettings,
      "preset" | "title" | "subject" | "creator" | "description"
    >
  >
> = {
  pageMargins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  },
  fontFamily: "Times New Roman",
  fontSize: 12,
  lineSpacing: 2.0,
  paragraphSpacing: {
    before: 0,
    after: 0,
  },
  headingFontFamily: "Times New Roman",
  headingSizes: {
    h1: 12,
    h2: 12,
    h3: 12,
    h4: 12,
    h5: 12,
    h6: 12,
  },
};

/**
 * MLA preset
 */
const MLA_PRESET: Required<
  Omit<
    DocxExportSettings,
    "preset" | "title" | "subject" | "creator" | "description"
  >
> = {
  pageMargins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  },
  fontFamily: "Times New Roman",
  fontSize: 12,
  lineSpacing: 2.0,
  paragraphSpacing: {
    before: 0,
    after: 0,
  },
  headingFontFamily: "Times New Roman",
  headingSizes: {
    h1: 12,
    h2: 12,
    h3: 12,
    h4: 12,
    h5: 12,
    h6: 12,
  },
};

/**
 * Chicago/Turabian preset
 */
const CHICAGO_PRESET: Required<
  Omit<
    DocxExportSettings,
    "preset" | "title" | "subject" | "creator" | "description"
  >
> = {
  pageMargins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  },
  fontFamily: "Times New Roman",
  fontSize: 12,
  lineSpacing: 2.0,
  paragraphSpacing: {
    before: 0,
    after: 0,
  },
  headingFontFamily: "Times New Roman",
  headingSizes: {
    h1: 14,
    h2: 13,
    h3: 12,
    h4: 12,
    h5: 12,
    h6: 12,
  },
};

/**
 * Default custom preset (more modern styling)
 */
const CUSTOM_PRESET: Required<
  Omit<
    DocxExportSettings,
    "preset" | "title" | "subject" | "creator" | "description"
  >
> = {
  pageMargins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  },
  fontFamily: "Calibri",
  fontSize: 11,
  lineSpacing: 1.15,
  paragraphSpacing: {
    before: 0,
    after: 8,
  },
  headingFontFamily: "Calibri",
  headingSizes: {
    h1: 16,
    h2: 14,
    h3: 12,
    h4: 11,
    h5: 11,
    h6: 11,
  },
};

/**
 * Get preset configuration
 */
function getPresetConfig(
  preset?: string
): Required<
  Omit<
    DocxExportSettings,
    "preset" | "title" | "subject" | "creator" | "description"
  >
> {
  switch (preset) {
    case "research":
      return RESEARCH_PRESET;
    case "apa":
      return APA_PRESET;
    case "mla":
      return MLA_PRESET;
    case "chicago":
      return CHICAGO_PRESET;
    case "custom":
    default:
      return CUSTOM_PRESET;
  }
}

/**
 * Merge user settings with preset
 */
function mergeSettings(
  userSettings: DocxExportSettings = {}
): Required<
  Omit<DocxExportSettings, "title" | "subject" | "creator" | "description">
> &
  Pick<DocxExportSettings, "title" | "subject" | "creator" | "description"> {
  const preset = getPresetConfig(userSettings.preset || "research");

  return {
    ...preset,
    ...userSettings,
    preset: userSettings.preset || "research",
    pageMargins: {
      ...preset.pageMargins,
      ...userSettings.pageMargins,
    },
    paragraphSpacing: {
      ...preset.paragraphSpacing,
      ...userSettings.paragraphSpacing,
    },
    headingSizes: {
      ...preset.headingSizes,
      ...userSettings.headingSizes,
    },
  };
}

/**
 * Context object to pass settings through conversion functions
 */
type ConversionContext = {
  settings: ReturnType<typeof mergeSettings>;
};

/**
 * Converts TipTap JSON content to DOCX format and triggers download
 * @param {Object} tiptapJson - The TipTap editor JSON content
 * @param {string} filename - The output filename (default: 'document.docx')
 * @param {DocxExportSettings} settings - Export configuration settings
 */
export async function exportToDocx(
  tiptapJson: any,
  filename: string = "document.docx",
  settings: DocxExportSettings = {}
) {
  const mergedSettings = mergeSettings(settings);
  const context: ConversionContext = { settings: mergedSettings };

  const sections = convertTipTapToDocx(tiptapJson, context);

  // Configure document properties

  // if (mergedSettings.title) properties.title = mergedSettings.title;
  // if (mergedSettings.subject) properties.subject = mergedSettings.subject;
  // if (mergedSettings.creator) properties.creator = mergedSettings.creator;
  // if (mergedSettings.description)
  //   properties.description = mergedSettings.description;

  const extraProperties: Pick<
    Mutable<IPropertiesOptions>,
    "creator" | "title" | "description" | "subject"
  > = {};
  if (mergedSettings.title) extraProperties.title = mergedSettings.title;
  if (mergedSettings.subject) extraProperties.subject = mergedSettings.subject;
  if (mergedSettings.creator) extraProperties.creator = mergedSettings.creator;

  const doc = new Document({
    ...extraProperties,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(mergedSettings.pageMargins.top),
              right: convertInchesToTwip(mergedSettings.pageMargins.right),
              bottom: convertInchesToTwip(mergedSettings.pageMargins.bottom),
              left: convertInchesToTwip(mergedSettings.pageMargins.left),
            },
          },
        },
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  // Create download link and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Recursively converts TipTap JSON nodes to DOCX paragraphs
 */
function convertTipTapToDocx(content: any, context: ConversionContext) {
  const paragraphs: any[] = [];

  if (!content || !content.content) {
    return paragraphs;
  }

  for (const node of content.content) {
    const converted = convertNode(node, context);
    if (converted) {
      if (Array.isArray(converted)) {
        paragraphs.push(...converted);
      } else {
        paragraphs.push(converted);
      }
    }
  }

  return paragraphs;
}

/**
 * Converts a single TipTap node to DOCX element(s)
 */
function convertNode(node: any, context: ConversionContext): any {
  switch (node.type) {
    case "paragraph":
      return convertParagraph(node, context);

    case "heading":
      return convertHeading(node, context);

    case "bulletList":
      return convertBulletList(node, context);

    case "orderedList":
      return convertOrderedList(node, context);

    case "listItem":
      return convertListItem(node, context);

    case "codeBlock":
      return convertCodeBlock(node, context);

    case "blockquote":
      return convertBlockquote(node, context);

    case "horizontalRule":
      return new Paragraph({
        text: "_______________________________________________",
        alignment: AlignmentType.CENTER,
      });

    default:
      return convertParagraph(node, context);
  }
}

/**
 * Converts a paragraph node
 */
function convertParagraph(node: any, context: ConversionContext) {
  const textRuns = extractTextRuns(node.content || [], context);
  const { settings } = context;

  const alignment = node.attrs?.textAlign
    ? getAlignment(node.attrs.textAlign)
    : AlignmentType.LEFT;

  return new Paragraph({
    children: textRuns.length > 0 ? textRuns : [new TextRun({ text: "" })],
    alignment,
    spacing: {
      before: settings.paragraphSpacing.before * 20,
      after: settings.paragraphSpacing.after * 20,
      line: Math.round(settings.lineSpacing * 240),
      lineRule: "auto" as any,
    },
  });
}

/**
 * Converts a heading node
 */
function convertHeading(node: any, context: ConversionContext) {
  const level = node.attrs?.level || 1;
  const { settings } = context;

  // For APA preset, apply specific formatting rules
  if (settings.preset === "apa") {
    return convertAPAHeading(node, level, context);
  }

  // Default heading conversion for other presets
  const textRuns = extractTextRuns(node.content || [], context, true, level);

  const headingLevels: Record<number, ValueOf<typeof HeadingLevel>> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };

  return new Paragraph({
    children: textRuns,
    heading: headingLevels[level] || HeadingLevel.HEADING_1,
    spacing: {
      before: settings.paragraphSpacing.before * 20,
      after: settings.paragraphSpacing.after * 20,
      line: Math.round(settings.lineSpacing * 240),
      lineRule: "auto" as any,
    },
  });
}

/**
 * Converts heading with APA 7th edition formatting
 */
function convertAPAHeading(
  node: any,
  level: number,
  context: ConversionContext
) {
  const { settings } = context;
  const textContent = extractPlainText(node.content || []);

  // APA heading styles
  switch (level) {
    case 1:
      // Level 1: Centered, Bold, Title Case
      return new Paragraph({
        children: [
          new TextRun({
            text: textContent,
            bold: true,
            font: settings.headingFontFamily,
            size: settings.headingSizes.h1 * 2,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          before: settings.paragraphSpacing.before * 20,
          after: settings.paragraphSpacing.after * 20,
          line: Math.round(settings.lineSpacing * 240),
          lineRule: "auto" as any,
        },
      });

    case 2:
      // Level 2: Flush Left, Bold, Title Case
      return new Paragraph({
        children: [
          new TextRun({
            text: textContent,
            bold: true,
            font: settings.headingFontFamily,
            size: settings.headingSizes.h2 * 2,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: {
          before: settings.paragraphSpacing.before * 20,
          after: settings.paragraphSpacing.after * 20,
          line: Math.round(settings.lineSpacing * 240),
          lineRule: "auto" as any,
        },
      });

    case 3:
      // Level 3: Flush Left, Bold Italic, Title Case
      return new Paragraph({
        children: [
          new TextRun({
            text: textContent,
            bold: true,
            italics: true,
            font: settings.headingFontFamily,
            size: settings.headingSizes.h3 * 2,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: {
          before: settings.paragraphSpacing.before * 20,
          after: settings.paragraphSpacing.after * 20,
          line: Math.round(settings.lineSpacing * 240),
          lineRule: "auto" as any,
        },
      });

    case 4:
      // Level 4: Indented, Bold, Title Case, Ending with Period
      // Note: In APA, text continues on same line, but TipTap separates headings from content
      return new Paragraph({
        children: [
          new TextRun({
            text: textContent.endsWith(".") ? textContent : textContent + ".",
            bold: true,
            font: settings.headingFontFamily,
            size: settings.headingSizes.h4 * 2,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.LEFT,
        indent: {
          left: 720, // 0.5 inch indent
        },
        spacing: {
          before: settings.paragraphSpacing.before * 20,
          after: settings.paragraphSpacing.after * 20,
          line: Math.round(settings.lineSpacing * 240),
          lineRule: "auto" as any,
        },
      });

    case 5:
      // Level 5: Indented, Bold Italic, Title Case, Ending with Period
      return new Paragraph({
        children: [
          new TextRun({
            text: textContent.endsWith(".") ? textContent : textContent + ".",
            bold: true,
            italics: true,
            font: settings.headingFontFamily,
            size: settings.headingSizes.h5 * 2,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.LEFT,
        indent: {
          left: 720, // 0.5 inch indent
        },
        spacing: {
          before: settings.paragraphSpacing.before * 20,
          after: settings.paragraphSpacing.after * 20,
          line: Math.round(settings.lineSpacing * 240),
          lineRule: "auto" as any,
        },
      });

    default:
      // Level 6 (if exists): Same as Level 5
      return new Paragraph({
        children: [
          new TextRun({
            text: textContent.endsWith(".") ? textContent : textContent + ".",
            bold: true,
            italics: true,
            font: settings.headingFontFamily,
            size: settings.headingSizes.h6 * 2,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.LEFT,
        indent: {
          left: 720,
        },
        spacing: {
          before: settings.paragraphSpacing.before * 20,
          after: settings.paragraphSpacing.after * 20,
          line: Math.round(settings.lineSpacing * 240),
          lineRule: "auto" as any,
        },
      });
  }
}

/**
 * Converts a bullet list
 */
function convertBulletList(node: any, context: ConversionContext) {
  const paragraphs: any[] = [];

  if (node.content) {
    for (const item of node.content) {
      if (item.type === "listItem") {
        const itemParas = convertListItem(item, context, "bullet");
        paragraphs.push(...itemParas);
      }
    }
  }

  return paragraphs;
}

/**
 * Converts an ordered list
 */
function convertOrderedList(node: any, context: ConversionContext) {
  const paragraphs: any[] = [];

  if (node.content) {
    for (const item of node.content) {
      if (item.type === "listItem") {
        const itemParas = convertListItem(item, context, "number");
        paragraphs.push(...itemParas);
      }
    }
  }

  return paragraphs;
}

/**
 * Converts a list item
 */
function convertListItem(
  node: any,
  context: ConversionContext,
  bulletType: "bullet" | "number" = "bullet"
) {
  const paragraphs: any[] = [];
  const { settings } = context;

  if (node.content) {
    for (let i = 0; i < node.content.length; i++) {
      const childNode = node.content[i];

      if (childNode.type === "paragraph") {
        const textRuns = extractTextRuns(childNode.content || [], context);

        paragraphs.push(
          new Paragraph({
            children:
              textRuns.length > 0 ? textRuns : [new TextRun({ text: "" })],
            bullet: bulletType === "bullet" ? { level: 0 } : undefined,
            numbering:
              bulletType === "number"
                ? { reference: "default-numbering", level: 0 }
                : undefined,
            spacing: {
              before: settings.paragraphSpacing.before * 20,
              after: settings.paragraphSpacing.after * 20,
              line: Math.round(settings.lineSpacing * 240),
              lineRule: "auto" as any,
            },
          })
        );
      } else {
        const converted = convertNode(childNode, context);
        if (converted) {
          paragraphs.push(
            ...(Array.isArray(converted) ? converted : [converted])
          );
        }
      }
    }
  }

  return paragraphs;
}

/**
 * Converts a code block
 */
function convertCodeBlock(node: any, context: ConversionContext) {
  const textContent = extractPlainText(node.content || []);

  return new Paragraph({
    children: [
      new TextRun({
        text: textContent,
        font: "Courier New",
        size: 20,
      }),
    ],
    shading: {
      fill: "F5F5F5",
    },
  });
}

/**
 * Converts a blockquote
 */
function convertBlockquote(node: any, context: ConversionContext) {
  const paragraphs: any[] = [];

  if (node.content) {
    for (const childNode of node.content) {
      const converted = convertNode(childNode, context);
      if (converted) {
        const parasToModify = Array.isArray(converted)
          ? converted
          : [converted];

        for (const para of parasToModify) {
          paragraphs.push(
            new Paragraph({
              ...para,
              indent: { left: 720 },
            })
          );
        }
      }
    }
  }

  return paragraphs;
}

/**
 * Extracts text runs from content with formatting
 */
function extractTextRuns(
  content: any[],
  context: ConversionContext,
  isHeading: boolean = false,
  headingLevel: number = 1
) {
  const runs: TextRun[] = [];
  const { settings } = context;

  for (const item of content) {
    if (item.type === "text") {
      const marks = item.marks || [];

      const fontSize = isHeading
        ? (settings.headingSizes as any)[`h${headingLevel}`]
        : settings.fontSize;

      const fontFamily = isHeading
        ? settings.headingFontFamily
        : settings.fontFamily;

      const runOptions: any = {
        text: item.text || "",
        font: fontFamily,
        size: fontSize * 2, // DOCX uses half-points
        color: "000000", // Always set text color to black
      };

      // Apply marks
      for (const mark of marks) {
        switch (mark.type) {
          case "bold":
            runOptions.bold = true;
            break;
          case "italic":
            runOptions.italics = true;
            break;
          case "underline":
            runOptions.underline = {};
            break;
          case "strike":
            runOptions.strike = true;
            break;
          case "code":
            runOptions.font = "Courier New";
            runOptions.shading = { fill: "F5F5F5" };
            break;
          case "link":
            runOptions.style = "Hyperlink";
            runOptions.color = "0563C1"; // Standard hyperlink blue
            break;
        }
      }

      runs.push(new TextRun(runOptions));
    } else if (item.type === "hardBreak") {
      runs.push(new TextRun({ text: "", break: 1 }));
    }
  }

  return runs;
}

/**
 * Extracts plain text from content (for code blocks)
 */
function extractPlainText(content: any[]): string {
  let text = "";

  for (const item of content) {
    if (item.type === "text") {
      text += item.text || "";
    } else if (item.content) {
      text += extractPlainText(item.content);
    }
  }

  return text;
}

/**
 * Maps TipTap text alignment to DOCX alignment
 */
function getAlignment(align: string) {
  const alignmentMap: Record<string, ValueOf<typeof AlignmentType>> = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    justify: AlignmentType.JUSTIFIED,
  };

  return alignmentMap[align] || AlignmentType.LEFT;
}

/**
 * React hook for TipTap export functionality
 */
export function useTipTapExport(editor: any, settings?: DocxExportSettings) {
  const handleExport = async (filename?: string) => {
    if (!editor) return;

    const json = editor.getJSON();
    await exportToDocx(json, filename || "document.docx", settings);
  };

  return { handleExport };
}
