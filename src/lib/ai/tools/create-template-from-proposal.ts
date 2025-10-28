import { tool } from "ai";
import type { User } from "better-auth";
import z from "zod";
import { PROPOSAL_TONE } from "@/lib/db";
import { createTemplate } from "@/lib/db/operations/template";

export const createTemplateFromProposal = (user: User) =>
  tool({
    description:
      "Create a new template from a user proposal if the proposal was created without a template.",
    inputSchema: z.object({
      proposalContent: z.string().describe("The full proposal text"),
      title: z
        .string()
        .max(100)
        .describe(
          "A short title for the template, e.g., 'Upwork Content Writer Proposal'",
        ),
      description: z
        .string()
        .max(255)
        .optional()
        .describe("A brief description of the template"),
      tone: z.enum(PROPOSAL_TONE).describe("The tone of the proposal"),
      category: z
        .string()
        .max(50)
        .optional()
        .describe("The category of the template, e.g., 'Content Writing'"),
      tags: z
        .array(z.string().max(30))
        .max(5)
        .optional()
        .describe(
          "Up to 5 tags for the template, e.g., ['writing', 'blogging']",
        ),
    }),
    execute: async (input) => {
      const template = await createTemplate({
        userId: user.id,
        title: input.title,
        description: input.description,
        content: input.proposalContent,
        tone: input.tone,
        category: input.category,
        tags: input.tags,
        status: "active",
      });
      return { templateId: template.id };
    },
  });
