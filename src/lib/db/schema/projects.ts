import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { users } from "./auth";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Basic project information
  title: varchar("title", { length: 255 }).notNull(),
  details: text("details").notNull(), // Rich text content in HTML format

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Project validation schemas
export const insertProjectSchema = createInsertSchema(projects);
export const updateProjectSchema = createUpdateSchema(projects);
