"use server";

import { headers } from "next/headers";
import { type ProposalTracking, updateProposalTrackingSchema } from "@/db";
import { proposalTrackingOperations } from "@/db/operations";
import { auth } from "../auth";

export const updateProposal = async (
  proposalId: string,
  data: Partial<ProposalTracking>,
) => {
  try {
    const validatedData = updateProposalTrackingSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing proposal to verify ownership
    const existingProposal =
      await proposalTrackingOperations.getById(proposalId);
    if (!existingProposal) {
      return { data: null, error: "Proposal not found", success: false };
    }

    if (existingProposal.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    // Update proposal status
    const updatedProposal = await proposalTrackingOperations.update(
      proposalId,
      validatedData,
    );

    return { data: updatedProposal, error: null, success: true };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { data: null, error: "Failed to toggle favorite", success: false };
  }
};
