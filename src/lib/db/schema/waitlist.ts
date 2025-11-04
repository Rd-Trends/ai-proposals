import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const waitlist = pgTable("waitlist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  invitedBy: text("invited_by"), // Email of the person who invited them, or "admin"
  invitedAt: timestamp("invited_at")
    .$defaultFn(() => new Date())
    .notNull(),
  usedAt: timestamp("used_at"), // When they signed up
  notes: text("notes"), // Optional notes about the invite
  isActive: boolean("is_active")
    .$defaultFn(() => true)
    .notNull(), // Can be disabled without deleting
});

// Types
export type Waitlist = typeof waitlist.$inferSelect;
export type NewWaitlist = typeof waitlist.$inferInsert;
