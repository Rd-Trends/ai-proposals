import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { users } from "./auth";
import { templates } from "./templates";

// Proposal enums
export const PROPOSAL_OUTCOME = [
  "proposal_sent",
  "proposal_viewed",
  "client_responded",
  "interviewed",
  "job_awarded",
  "proposal_rejected",
  "no_response",
] as const;
export const proposalOutcomeEnum = pgEnum("proposal_outcome", PROPOSAL_OUTCOME);

export const proposalTracking = pgTable("proposal_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  templateId: uuid("template_id").references(() => templates.id, {
    onDelete: "cascade",
  }),

  // Proposal details
  proposalContent: text("proposal_content"), // the actual proposal content that was sent
  proposalLength: integer("proposal_length"), // word count

  // Current status
  currentOutcome: proposalOutcomeEnum("current_outcome")
    .default("proposal_sent")
    .notNull(),

  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  jobDescription: text("job_description").notNull(),
  jobPostingUrl: text("job_posting_url"), // URL of the job posting
  platform: varchar("platform", { length: 50 }), // e.g., "upwork", "freelancer", "direct"

  // Important dates
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  interviewedAt: timestamp("interviewed_at"),
  completedAt: timestamp("completed_at"), // when final outcome was reached

  // Notes
  notes: text("notes"), // user notes about the proposal/outcome

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Proposal types
export type ProposalTracking = typeof proposalTracking.$inferSelect;
export type NewProposalTracking = typeof proposalTracking.$inferInsert;
export type ProposalOutcome = (typeof PROPOSAL_OUTCOME)[number];

// Proposal validation schemas
export const createProposalTrackingSchema =
  createInsertSchema(proposalTracking);
export const updateProposalTrackingSchema =
  createUpdateSchema(proposalTracking);
