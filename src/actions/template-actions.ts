"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { headers } from "next/headers";
import z from "zod";
import {
  type InsertTemplate,
  insertTemplateSchema,
  PROPOSAL_TONE,
  updateTemplateSchema,
} from "@/db";
import * as templateServices from "@/db/operations/template";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";

const getPrompt = (user: User) => {
  const userContext = `
USER INFORMATION:
Name: ${user.name || "User"}
Professional Background: ${user.bio || "No background information provided"}
`;

  return `You are an expert freelance proposal strategist with deep knowledge of what makes proposals successful on platforms like Upwork, Fiverr, and others.

${userContext}

Based on the user's professional background above, your task is to generate complete, professional, and customizable proposal templates that align with their expertise and experience. Your response must precisely match the style, structure, and formatting of the provided examples, while incorporating relevant aspects of the user's background. The only things that should change are the content, words, and specific sections based on the user's request and professional context. Do not add any extra commentary, explanations, or analysis.

### Core Template Requirements:

- **Engaging Hook**: Start with a strong, personalized opening.
- **Clear Structure**: Use a logical flow with distinct sections.
- **Credibility & Proof**: Include sections for experience, testimonials, and portfolio links.
- **Call to Action**: End with clear next steps.

---

### Template Style Examples:

**Example 1: Process-Focused (Detailed approach)**

\`\`\`
Hello, here's my innovative approach to achieving success in your project, which is designed to [key benefit]:
📌 First, we'll have a conversation to discuss your SPECIFIC goals...
📌 Next, I'll conduct thorough research and analysis...
📌 I will then develop a tailored strategy...
[Continue with 6-8 process steps]

I believe I am a great fit for this role because:
- I have a 100% job success score
- [Meet each requirement with bullets]

What sets me apart is [unique specialty/expertise]...

Here's what a former client said:
"[Testimonial]" - Client Name

Portfolio: [link]
Looking forward to working together.
[Professional sign-off]
\`\`\`

**Example 2: Short & Direct**

\`\`\`
Hi [Client name],

I can deliver exactly what you need for your [project type]. Here's how:

• [Key step 1]
• [Key step 2]
• [Key step 3]

I've completed [X similar projects] with [specific results]. My approach focuses on [main value proposition].

Available to start immediately. Let's discuss your vision!

Best regards,
[Name]
\`\`\`

**Example 3: Passionate & Personal**

\`\`\`
Hi [Client name],

I just finished reading your project description and I have to say - this is exactly the kind of work that lights me up! [Specific element from their project] really resonates with me because [personal connection/shared value/experience].

The moment I saw [specific detail they mentioned], I knew I had to reach out. This isn't just another project for me - it's the kind of work I'm genuinely passionate about and where I do my best work.

Here's what I'll bring to your project:
- [Skill/experience 1 with personal touch]
- [Skill/experience 2 with enthusiasm]
- [Unique approach or perspective]

I don't just deliver work - I become invested in your success. [Brief story or example of going above and beyond].

I'd love to learn more about your vision and share some ideas I already have brewing!

Excited to potentially collaborate,
[Name with personal brand element]
\`\`\`

**Now, generate a complete, ready-to-use proposal template that mimics the style of one of the above examples. Choose the style that best fits the job description. Do not generate a response that is not in the format of one of the above examples.**`;
};

export const generateTemplateContent = async (input: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const result = await generateObject({
      model: openai("gpt-4.1"), // best model for this (cheap but very effective)
      system: getPrompt(session.user),
      prompt: input,
      temperature: 1,
      schema: z.object({
        content: z.string().describe("The generated proposal template content"),
        tone: z
          .enum(PROPOSAL_TONE)
          .describe(
            "The tone of the proposal (e.g., professional, friendly, creative)",
          ),
        category: z
          .string()
          .describe(
            "The category of the proposal (e.g., web development, design)",
          ),
        description: z
          .string()
          .describe("A short description of the template usage (max 30 words)"),
      }),
    });

    return result.object;
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error("Failed to generate template");
  }
};

export const createTemplate = async (data: InsertTemplate) => {
  try {
    // Validate and process the data as needed
    const validatedData = insertTemplateSchema.parse(data);
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const template = await templateServices.createTemplate({
      ...validatedData,
      userId: session.user.id,
    });

    return { data: template, error: null, success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.join(", "), success: false };
    }
    console.error("Error creating template:", error);
    return { data: null, error: "Failed to create template", success: false };
  }
};

export const updateTemplate = async (
  id: string,
  data: Partial<InsertTemplate>,
) => {
  try {
    // Validate and process the data as needed
    const validatedData = updateTemplateSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing template to verify ownership
    const existingTemplate = await templateServices.getTemplateById(id);
    if (!existingTemplate) {
      return { data: null, error: "Template not found", success: false };
    }

    if (existingTemplate.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    const template = await templateServices.updateTemplate(id, validatedData);

    return { data: template, error: null, success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.join(", "), success: false };
    }
    console.error("Error updating template:", error);
    return { data: null, error: "Failed to update template", success: false };
  }
};

export const duplicateTemplate = async (id: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing template
    const existingTemplate = await templateServices.getTemplateById(id);
    if (!existingTemplate) {
      return { data: null, error: "Template not found", success: false };
    }

    if (existingTemplate.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    // Create duplicate with modified title
    const duplicateData = {
      ...existingTemplate,
      title: `${existingTemplate.title} (Copy)`,
      usageCount: 0,
      successRate: null,
      lastUsedAt: null,
      userId: session.user.id,
    };

    const { id: _, updatedAt: __, createdAt: ___, ...rest } = duplicateData; // Exclude the id field

    const template = await templateServices.createTemplate(rest);

    return { data: template, error: null, success: true };
  } catch (error) {
    console.error("Error duplicating template:", error);
    return {
      data: null,
      error: "Failed to duplicate template",
      success: false,
    };
  }
};

export const deleteTemplate = async (id: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing template to verify ownership
    const existingTemplate = await templateServices.getTemplateById(id);
    if (!existingTemplate) {
      return { data: null, error: "Template not found", success: false };
    }

    if (existingTemplate.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    await templateServices.deleteTemplate(id);

    return { data: null, error: null, success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { data: null, error: "Failed to delete template", success: false };
  }
};

export const toggleTemplateFavorite = async (id: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing template to verify ownership
    const existingTemplate = await templateServices.getTemplateById(id);
    if (!existingTemplate) {
      return { data: null, error: "Template not found", success: false };
    }

    if (existingTemplate.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    const template = await templateServices.toggleTemplateFavorite(id);

    return { data: template, error: null, success: true };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { data: null, error: "Failed to toggle favorite", success: false };
  }
};
