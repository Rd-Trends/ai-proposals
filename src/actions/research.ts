"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { headers } from "next/headers";
import z from "zod";
import { auth } from "@/lib/auth";

const inputSchema = z
  .string()
  .min(20)
  .max(20000)
  .describe("The content to be proofread");

const prompt = `
You are an expert proofreader. Review the HTML content and return the COMPLETE document with corrections marked.

Use INLINE changes for small text corrections (spelling, grammar, punctuation):
<span data-inline-change data-old="[original]" data-new="[corrected]">[corrected text]</span>

Use BLOCK changes for paragraph/section-level changes:
<div data-change-indicator>
  <div data-rejected-item>
    <p>[original paragraph]</p>
  </div>
  <div data-accepted-item>
    <p>[corrected paragraph]</p>
  </div>
</div>

EXAMPLES:

Inline change:
<p>The study of <span data-inline-change data-old="Cognitive giaging" data-new="Cognitive aging">Cognitive aging</span> is important.</p>

Block change:
<div data-change-indicator>
  <div data-rejected-item>
    <p>This entire paragraph needs major restructuring and changes.</p>
  </div>
  <div data-accepted-item>
    <p>This paragraph has been completely rewritten for clarity.</p>
  </div>
</div>

Rules:
- Use inline spans for: typos, grammar fixes, single word/phrase changes
- You can combine close inline changes into one change (say like between 2 - 5 words)
- Use block divs for: sentence restructuring, paragraph rewrites, major changes
- Always include data-old and data-new attributes for inline changes
- Return the COMPLETE document with all unchanged content included
`;

export const proofreadContent = async (input: string) => {
  try {
    inputSchema.parse(input);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const result = await generateObject({
      model: openai("gpt-5.1"), // best model for this (cheap but very effective)
      system: prompt,
      prompt: input,
      temperature: 1,
      schema: z.object({
        content: z.string().describe("The proofread content in html format"),
      }),
    });

    return result.object;
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error("Failed to generate template");
  }
};

const p = `You are an expert writer that can edit rich text documents. The user has selected part of the document. You will receive the current content of the selection (in HTML format) and the user's request. Re-write the content of the selection to meet the user's request. Generate the HTML code for the new content of the selection. If the user's request is not clear or does not relate to editing the document, generate HTML code where you ask the user to clarify the request. Your response should only contain the HTML code, no other text or explanation, no Markdown, and your HTML response should not be wrapped in backticks, Markdown code blocks, or other extra formatting.`;
