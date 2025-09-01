import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

// Enums
export const PROPOSAL_TONE = [
  "professional",
  "friendly",
  "confident",
  "enthusiastic",
  "formal",
  "casual",
] as const;
export const toneEnum = pgEnum("tone", PROPOSAL_TONE);

export const TEMPLATE_STATUS = ["draft", "active", "archived"] as const;
export const templateStatusEnum = pgEnum("template_status", TEMPLATE_STATUS);

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

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  bio: text("bio"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

// Templates table
export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"), // Short description of the template
  content: text("content").notNull(), // Main template content with placeholders
  tone: toneEnum("tone").default("professional").notNull(),
  status: templateStatusEnum("status").default("active").notNull(),

  // Template metadata
  category: varchar("category", { length: 100 }), // e.g., "web development", "writing", "design"
  tags: jsonb("tags").$type<string[]>().default([]), // Array of tags for categorization

  // Examples and customization
  examples: jsonb("examples").$type<{
    jobDescription?: string;
    sampleProposal?: string;
  }>(),

  // Usage statistics
  usageCount: integer("usage_count").default(0).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),

  // Template settings
  isPublic: boolean("is_public").default(false).notNull(), // For sharing templates
  isFavorite: boolean("is_favorite").default(false).notNull(),
});

// Proposal tracking table
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates),
  proposalTracking: many(proposalTracking),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
  proposalTracking: many(proposalTracking),
}));

export const proposalTrackingRelations = relations(
  proposalTracking,
  ({ one }) => ({
    user: one(users, {
      fields: [proposalTracking.userId],
      references: [users.id],
    }),
    template: one(templates, {
      fields: [proposalTracking.templateId],
      references: [templates.id],
    }),
  }),
);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
export type ProposalTracking = typeof proposalTracking.$inferSelect;
export type NewProposalTracking = typeof proposalTracking.$inferInsert;
export type Tone = (typeof PROPOSAL_TONE)[number];
export type TemplateStatus = (typeof TEMPLATE_STATUS)[number];
export type ProposalOutcome = (typeof PROPOSAL_OUTCOME)[number];

// Export schema
export const insertTemplateSchema = createInsertSchema(templates);
export const updateTemplateSchema = createUpdateSchema(templates);
export const createProposalTrackingSchema =
  createInsertSchema(proposalTracking);
export const updateProposalTrackingSchema =
  createUpdateSchema(proposalTracking);
