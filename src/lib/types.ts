import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { createTemplateFromProposal } from "./ai/tools/create-template-from-proposal";
import type { getProjectsAndCaseStudies } from "./ai/tools/get-projects-and-case-studies";
import type { getTemplates } from "./ai/tools/get-templates";
import type { getTestimonials } from "./ai/tools/get-testimonials";
import type { saveProposals } from "./ai/tools/save-proposals";

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type createTemplateFromProposalTool = InferUITool<
  ReturnType<typeof createTemplateFromProposal>
>;
type getProjectsAndCaseStudiesTool = InferUITool<
  ReturnType<typeof getProjectsAndCaseStudies>
>;
type getTemplatesTool = InferUITool<ReturnType<typeof getTemplates>>;
type getTestimonialsTool = InferUITool<ReturnType<typeof getTestimonials>>;
type saveProposalTool = InferUITool<ReturnType<typeof saveProposals>>;

export type ChatTools = {
  createTemplateFromProposal: createTemplateFromProposalTool;
  getProjectsAndCaseStudies: getProjectsAndCaseStudiesTool;
  getTemplates: getTemplatesTool;
  getTestimonials: getTestimonialsTool;
  saveProposal: saveProposalTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  appendMessage: string;
  id: string;
  title: string;
  clear: null;
  finish: null;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PageMetadata = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PageMetadata;
};
