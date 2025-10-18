import { desc, eq } from "drizzle-orm";
import { db } from "../drizzle";
import {
  type NewProposalTracking,
  type ProposalTracking,
  proposalTracking,
} from "../index";

// Create a new proposal tracking entry
export async function createProposalTracking(
  proposalData: NewProposalTracking,
): Promise<ProposalTracking> {
  const [proposal] = await db
    .insert(proposalTracking)
    .values(proposalData)
    .returning();
  return proposal;
}

// Get proposal by ID
export async function getProposalTrackingById(
  id: string,
): Promise<ProposalTracking | null> {
  const [proposal] = await db
    .select()
    .from(proposalTracking)
    .where(eq(proposalTracking.id, id));
  return proposal || null;
}

// Get proposals by user ID
export async function getProposalTrackingByUserId(
  userId: string,
): Promise<ProposalTracking[]> {
  return await db
    .select()
    .from(proposalTracking)
    .where(eq(proposalTracking.userId, userId))
    .orderBy(desc(proposalTracking.sentAt));
}

// Update proposal tracking
export async function updateProposalTracking(
  id: string,
  data: Partial<ProposalTracking>,
): Promise<ProposalTracking> {
  const [proposal] = await db
    .update(proposalTracking)
    .set(data)
    .where(eq(proposalTracking.id, id))
    .returning();

  return proposal;
}

// Update proposal with notes
export async function addProposalTrackingNotes(
  id: string,
  notes: string,
): Promise<ProposalTracking> {
  const [proposal] = await db
    .update(proposalTracking)
    .set({
      notes,
      updatedAt: new Date(),
    })
    .where(eq(proposalTracking.id, id))
    .returning();

  return proposal;
}

// Delete proposal tracking entry
export async function deleteProposalTracking(id: string): Promise<void> {
  await db.delete(proposalTracking).where(eq(proposalTracking.id, id));
}
