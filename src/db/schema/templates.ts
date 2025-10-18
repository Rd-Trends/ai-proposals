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
import { users } from "./auth";

// Template enums
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

// Template types
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
export type Tone = (typeof PROPOSAL_TONE)[number];
export type TemplateStatus = (typeof TEMPLATE_STATUS)[number];

// Template validation schemas
export const insertTemplateSchema = createInsertSchema(templates);
export const updateTemplateSchema = createUpdateSchema(templates);
