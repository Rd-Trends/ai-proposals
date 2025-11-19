import type { ProposalOutcome } from "@/lib/db/schema/proposals";

export const getProposalStatusLabel = (outcome: ProposalOutcome) => {
  switch (outcome) {
    case "proposal_sent":
      return "Sent";
    case "proposal_viewed":
      return "Viewed";
    case "client_responded":
      return "Response";
    case "interviewed":
      return "Interview";
    case "job_awarded":
      return "Awarded";
    case "proposal_rejected":
      return "Rejected";
    case "no_response":
      return "No Response";
    default:
      return outcome;
  }
};

export const getProposalStatusBadgeVariant = (outcome: ProposalOutcome) => {
  switch (outcome) {
    case "job_awarded":
      return "default";
    case "interviewed":
      return "secondary";
    case "client_responded":
      return "outline";
    case "proposal_viewed":
      return "secondary";
    case "proposal_rejected":
      return "destructive";
    case "no_response":
      return "secondary";
    default:
      return "outline";
  }
};
