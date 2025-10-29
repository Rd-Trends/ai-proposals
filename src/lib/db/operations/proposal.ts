import { and, count, desc, eq } from "drizzle-orm";
import type { PaginatedResult, PaginationParams } from "@/lib/types";
import { db } from "../drizzle";
import {
  type NewProposalTracking,
  type ProposalTracking,
  proposalTracking,
} from "../index";
import { calculateTotalPages, getPaginationOffset } from "./util";

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

// Get proposals by user ID with pagination
export async function getProposalTrackingByUserId(
  userId: string,
  params?: PaginationParams,
): Promise<PaginatedResult<ProposalTracking>> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const offset = getPaginationOffset(page, pageSize);

  const conditions = [eq(proposalTracking.userId, userId)];

  const sq = db
    .select({ id: proposalTracking.id })
    .from(proposalTracking)
    .where(and(...conditions))
    .orderBy(desc(proposalTracking.sentAt))
    .limit(pageSize)
    .offset(offset)
    .as("subquery");

  const userProposals = await db
    .select()
    .from(proposalTracking)
    .innerJoin(sq, eq(proposalTracking.id, sq.id))
    .orderBy(desc(proposalTracking.sentAt));

  const [totalResult] = await db
    .select({ total: count() })
    .from(proposalTracking)
    .where(and(...conditions));

  const total = totalResult?.total ?? 0;
  const totalPages = calculateTotalPages(total, pageSize);

  return {
    data: userProposals.map((row) => row.proposal_tracking),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
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
