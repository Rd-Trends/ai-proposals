import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { users } from "./auth";

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Testimonial information
  clientName: varchar("client_name", { length: 100 }).notNull(),
  clientTitle: varchar("client_title", { length: 100 }), // e.g., "CEO at TechCorp"
  content: text("content").notNull(), // The testimonial text
  projectTitle: varchar("project_title", { length: 255 }), // Related project title

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Testimonial types
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

// Testimonial validation schemas
export const insertTestimonialSchema = createInsertSchema(testimonials);
export const updateTestimonialSchema = createUpdateSchema(testimonials);
