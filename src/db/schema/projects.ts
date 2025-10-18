import {
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

// Project enums
export const PROJECT_STATUS = [
  "planning",
  "in_progress",
  "completed",
  "on_hold",
  "cancelled",
] as const;
export const projectStatusEnum = pgEnum("project_status", PROJECT_STATUS);

export const PROJECT_TYPE = [
  "case_study",
  "client_work",
  "personal_project",
] as const;
export const projectTypeEnum = pgEnum("project_type", PROJECT_TYPE);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Basic project information
  title: varchar("title", { length: 255 }).notNull(),
  summary: varchar("summary", { length: 500 }), // Brief project summary for quick reference
  description: text("description").notNull(),

  // Project classification
  type: projectTypeEnum("type").default("case_study").notNull(),
  category: varchar("category", { length: 100 }), // e.g., "web development", "mobile app", "design"

  // URLs array with title and url
  urls: jsonb("urls").$type<{ title: string; url: string }[]>().default([]), // Array of project links

  // Timeline
  completedAt: timestamp("completed_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];
export type ProjectType = (typeof PROJECT_TYPE)[number];

// Project validation schemas
export const insertProjectSchema = createInsertSchema(projects);
export const updateProjectSchema = createUpdateSchema(projects);
