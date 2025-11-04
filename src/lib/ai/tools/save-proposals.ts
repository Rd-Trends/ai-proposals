import { tool } from "ai";
import type { User } from "better-auth";
import z from "zod";
import { createProposalTracking } from "@/lib/db/operations/proposal";
import { incrementTemplateUsage } from "@/lib/db/operations/template";

export const saveProposals = (user: User) =>
  tool({
    description:
      "Save generated proposals to the database so users can track their progress.",
    inputSchema: z.object({
      templateId: z
        .string()
        .uuid()
        .describe("The ID of the template if generated off a template")
        .nullable(),
      proposalContent: z.string().describe("The full proposal text"),
      proposalLength: z
        .number()
        .min(0)
        .describe("The length of the proposal in words"),
      jobTitle: z
        .string()
        .max(255)
        .describe("The job title, auto generated if not provided by user"),
      jobDescription: z.string().describe("The job description"),
      jobPostingUrl: z
        .string()
        .url()
        .optional()
        .describe("The URL of the job posting, if available"),
      platform: z
        .string()
        .max(50)
        .describe("The platform name if e.g., Upwork"),
    }),
    execute: async (input) => {
      try {
        const proposal = await createProposalTracking({
          userId: user.id,
          templateId: input.templateId,
          proposalContent: input.proposalContent,
          proposalLength: input.proposalLength,
          jobTitle: input.jobTitle,
          jobDescription: input.jobDescription,
          jobPostingUrl: input.jobPostingUrl,
          platform: input.platform,
          currentOutcome: "proposal_sent",
        });

        if (input.templateId) {
          await incrementTemplateUsage(input.templateId);
        }

        return { proposalId: proposal.id };
      } catch (error) {
        console.error("Error saving proposal:", error);
        throw error;
      }
    },
  });
