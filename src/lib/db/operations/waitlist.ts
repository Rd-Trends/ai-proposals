import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { type NewWaitlist, waitlist } from "@/lib/db/schema";

/**
 * Check if an email is on the waitlist and active
 */
export async function isEmailAllowed(email: string): Promise<boolean> {
  const result = await db
    .select()
    .from(waitlist)
    .where(
      and(eq(waitlist.email, email.toLowerCase()), eq(waitlist.isActive, true)),
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Add an email to the waitlist
 */
export async function addToWaitlist(data: NewWaitlist): Promise<void> {
  await db.insert(waitlist).values(data);
}

/**
 * Add multiple emails to the waitlist
 */
export async function addMultipleToWaitlist(
  emails: string[],
  invitedBy = "admin",
): Promise<void> {
  const values = emails.map((email) => ({
    email: email.toLowerCase(),
    invitedBy,
  }));

  await db.insert(waitlist).values(values);
}

/**
 * Mark a waitlist entry as used when user signs up
 */
export async function markWaitlistAsUsed(email: string): Promise<void> {
  await db
    .update(waitlist)
    .set({ usedAt: new Date() })
    .where(eq(waitlist.email, email.toLowerCase()));
}

/**
 * Remove an email from the waitlist
 */
export async function removeFromWaitlist(email: string): Promise<void> {
  await db.delete(waitlist).where(eq(waitlist.email, email.toLowerCase()));
}

/**
 * Deactivate a waitlist entry without deleting it
 */
export async function deactivateWaitlistEntry(email: string): Promise<void> {
  await db
    .update(waitlist)
    .set({ isActive: false })
    .where(eq(waitlist.email, email.toLowerCase()));
}

/**
 * Reactivate a waitlist entry
 */
export async function reactivateWaitlistEntry(email: string): Promise<void> {
  await db
    .update(waitlist)
    .set({ isActive: true })
    .where(eq(waitlist.email, email.toLowerCase()));
}

/**
 * Get all waitlist entries
 */
export async function getAllWaitlistEntries() {
  return await db.select().from(waitlist);
}

/**
 * Get unused waitlist entries
 */
export async function getUnusedWaitlistEntries() {
  return await db
    .select()
    .from(waitlist)
    .where(and(eq(waitlist.isActive, true), isNull(waitlist.usedAt)));
}
