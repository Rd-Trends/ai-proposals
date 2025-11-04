"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { headers } from "next/headers";
import z from "zod";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";
import {
  type InsertTemplate,
  insertTemplateSchema,
  PROPOSAL_TONE,
  updateTemplateSchema,
} from "@/lib/db";
import * as templateServices from "@/lib/db/operations/template";

const generateTemplateInputSchema = z
  .string()
  .min(10, "Input must be at least 10 characters")
  .max(2000, "Input must be less than 2000 characters");

const templateIdSchema = z
  .string()
  .min(1, "Template ID is required")
  .uuid("Invalid Template ID");

const getPrompt = (user: User) => {
  const userContext = `
USER INFORMATION:
Name: ${user.name || "User"}
Professional Background: ${user.bio || "No background information provided"}
`;

  return `You are an expert freelance proposal strategist with deep knowledge of what makes proposals successful on platforms like Upwork, Fiverr, and Contra.

${userContext}

Your task is to generate complete, professional, and reusable proposal templates based on the user's professional background and requirements. These templates should follow proven principles that win freelance jobs.

## CORE PRINCIPLES

1. **Professional yet approachable** - Use clear, friendly language that reflects the user's voice
2. **Specific over generic** - Use placeholders for concrete examples and measurable results
3. **Client-focused** - Address the client's needs, not just the user's qualifications
4. **Scannable structure** - Use short paragraphs (2-3 sentences), bullet points, and clear flow
5. **Customizable content** - Templates should be easy to personalize for specific job postings

---

## TEMPLATE STRUCTURE

Create templates with the following components:

#### 1. Personalized Greeting
A simple, professional greeting with a placeholder for the client's name.

**Example:** "Hi [Client Name],"

#### 2. Engaging Introduction (20-40 words)
Placeholder text that helps the user address specific client needs, goals, or pain points.

**Example:** "I have experience helping clients [achieve specific outcome] through [relevant service/skill]. My work focuses on [key benefit] that directly addresses [type of challenge]."

#### 3. Clear Approach with Actionable Steps
3-5 specific, actionable steps with placeholders that demonstrate a clear methodology.

**Example:**
"Here's how I approach [project type]:

1. **[Step 1 Title]:** [Description of what this step involves and its benefit]
2. **[Step 2 Title]:** [Description focusing on strategy or implementation]
3. **[Step 3 Title]:** [Description emphasizing quality or results]"

#### 4. Relevant Experience & Skills Section
Placeholder sections for the user to add their specific projects, skills, and results.

**Example:** "I recently completed [Project Name/Type], where I [specific achievement with measurable outcome]. This project involved [relevant technologies/approaches] and resulted in [quantifiable result like X% improvement]."

**Include guidance like:**
- [Add specific project example that matches the job requirements]
- [Mention relevant technologies or methodologies you used]
- [Include quantifiable results: percentages, timeframes, metrics]

#### 5. Social Proof Section (Optional)
Placeholder for testimonials with proper attribution format.

**Example:** "[Client testimonial highlighting relevant skills or results] - [Client Name, Title at Company]"

#### 6. Strong Call to Action
Clear next steps that encourage the client to respond.

**Example:** "I'd love to discuss how I can help you achieve [specific goal]. Are you available for a brief call this week to explore your requirements in detail?"

---

## TEMPLATE STYLE EXAMPLES

Generate templates in ONE of these proven styles based on the user's request:

**Style 1: Process-Focused (Detailed Approach)**
Best for: Technical projects, complex deliverables, clients who want to understand methodology

Hi [Client Name],

I've helped [number] clients [achieve specific outcome] through a proven approach that focuses on [key benefit]. Your [specific need/challenge mentioned in job posting] is exactly the type of project where my methodology delivers results.

Here's how I'll tackle your project:

1. **[Discovery/Research Phase]:** I'll start by [specific activity] to understand [key aspect]. This ensures [benefit].

2. **[Strategy/Planning Phase]:** Next, I'll [specific action] to develop [deliverable] that addresses [client need].

3. **[Implementation Phase]:** I'll then [specific process] using [relevant tools/methods], focusing on [quality aspect].

4. **[Testing/Refinement Phase]:** Throughout the project, I'll [quality assurance approach] to ensure [desired outcome].

5. **[Delivery/Support Phase]:** Finally, I'll [delivery method] and provide [additional value like documentation or training].

[Add specific project example: "I recently completed [Project Name/Type], where I [specific action] and achieved [quantifiable result like X% improvement or completion in Y timeframe]. This project involved [relevant technologies/approaches] that directly align with your requirements."]

[Optional testimonial: "Here's what [Client Name, Title at Company] said: '[Brief testimonial highlighting relevant skills or results]'"]

I'm excited about the possibility of working together on this. Let's schedule a call to discuss your vision and how I can bring it to life.

Best regards,
[Your Name]

---

**Style 2: Results-Focused (Short & Direct)**
Best for: Fast turnaround projects, straightforward requirements, busy clients

Hi [Client Name],

I can deliver [specific outcome] for your [project type]. I've completed [number] similar projects, achieving results like [specific measurable outcome].

Here's what you can expect:

• [Key deliverable 1 with specific detail and benefit]
• [Key deliverable 2 with specific detail and benefit]
• [Key deliverable 3 with specific detail and benefit]

[Add recent success example: "For a recent client, I [specific action] which resulted in [quantifiable result like 40% increase or 2-week completion]. I used [relevant tools/methodology] to ensure [client benefit]."]

I'm available to start [timeframe] and can deliver within [estimated timeline]. Let's discuss your specific requirements!

Best regards,
[Your Name]

---

**Style 3: Relationship-Focused (Passionate & Personal)**
Best for: Creative projects, long-term collaborations, value-alignment focused clients

Hi [Client Name],

I just read through your project description, and [specific element from job posting] really resonates with me. This is exactly the type of work I'm passionate about because [connect to personal value or experience].

What excites me most about your project is [specific opportunity or challenge]. It's not just another job—it's the kind of work where I can truly make an impact. [Brief connection to how your background or experience makes you uniquely suited for this.]

[Share a brief story of a similar project: "I recently worked with [Client/Company] on [similar project type], where I [specific actions taken]. The project was successful because [key factors], resulting in [quantifiable outcome]. This experience taught me [relevant insight] that I'll bring to your project."]

I specialize in [relevant skill/approach] and have [number] years of experience in [relevant field/industry]. I don't just deliver work—I become invested in your success.

[Optional testimonial: "Here's what [Client Name, Role] said: '[Testimonial focusing on collaboration or dedication]'"]

I'd love to hear more about your vision and share some initial ideas I have for [project aspect]. Are you available for a brief call this week?

Looking forward to potentially collaborating!

[Your Name]

---

## WRITING GUIDELINES FOR TEMPLATES

### DO:
- Use clear placeholder markers like [Client Name], [Project Type], [Specific Outcome]
- Include guidance for what should go in each placeholder section
- Create scannable structure with short paragraphs and bullet points
- Focus language on client benefits and problem-solving
- Include sections for adding specific projects and metrics
- Make the template flow naturally as one cohesive piece
- Provide examples within placeholders to guide the user
- Leave room for personalization while maintaining structure

### DON'T:
- Use generic phrases like "I am a hard worker" or "I pay attention to detail"
- Add section headings unless they serve a clear structural purpose
- Use jargon or overly complex language
- Make templates self-focused instead of client-focused
- Include irrelevant placeholder sections
- Write templates that can't be easily customized
- Create templates longer than necessary for the style

---

## IMPORTANT GUIDELINES

- **Choose ONE style** that best fits the user's request and professional background
- **Make templates reusable** with clear placeholders for customization
- **Incorporate the user's professional background** naturally into the template structure
- **Keep templates flexible** so they can be adapted to various job postings
- **Focus on proven principles** that consistently win freelance jobs

Generate a complete, ready-to-use proposal template that follows these principles and can be easily customized for specific job applications.`;
};

export const generateTemplateContent = async (input: string) => {
  try {
    generateTemplateInputSchema.parse(input);

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
    templateIdSchema.parse(id);
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
    templateIdSchema.parse(id);

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
    templateIdSchema.parse(id);

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
    templateIdSchema.parse(id);

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
