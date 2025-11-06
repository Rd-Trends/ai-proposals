import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { type NewWaitlist, waitlist } from "@/lib/db/schema";

/**
 * Check waitlist status for an email
 * Returns status: 'not-in-waitlist' | 'activated' | 'pending'
 */
export async function getWaitlistStatus(
  email: string,
): Promise<"not-in-waitlist" | "activated" | "pending"> {
  const result = await db
    .select()
    .from(waitlist)
    .where(eq(waitlist.email, email.toLowerCase()))
    .limit(1);

  if (result.length === 0) {
    return "not-in-waitlist";
  }

  const entry = result[0];
  // User is activated if they're active OR have already used the invite
  if (entry.isActive || entry.usedAt !== null) {
    return "activated";
  }

  return "pending";
}

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
  entries: { email: string; name: string }[],
  invitedBy = "admin",
): Promise<void> {
  const values = entries.map((entry) => ({
    email: entry.email.toLowerCase(),
    name: entry.name,
    invitedBy,
  }));

  await db.insert(waitlist).values(values);
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
    .set({ isActive: true, usedAt: new Date() })
    .where(eq(waitlist.email, email.toLowerCase()));
}

/**
 * Get all waitlist entries
 */
export async function getAllWaitlistEntries() {
  return await db.select().from(waitlist).orderBy(desc(waitlist.invitedAt));
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
