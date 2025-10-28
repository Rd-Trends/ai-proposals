import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { conversations, messages } from "./conversations";
import { projects } from "./projects";
import { proposalTracking } from "./proposals";
import { templates } from "./templates";

// Validation schemas
export const insertTemplateSchema = createInsertSchema(templates);
export const updateTemplateSchema = createUpdateSchema(templates);
export const createProposalTrackingSchema =
  createInsertSchema(proposalTracking);
export const updateProposalTrackingSchema =
  createUpdateSchema(proposalTracking);
export const insertProjectSchema = createInsertSchema(projects);
export const updateProjectSchema = createUpdateSchema(projects);
export const insertConversationSchema = createInsertSchema(conversations);
export const updateConversationSchema = createUpdateSchema(conversations);
export const insertMessageSchema = createInsertSchema(messages);
