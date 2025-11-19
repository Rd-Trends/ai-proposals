"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ProposalTracking } from "@/lib/db/schema/proposals";
import { Button } from "../ui/button";
import {
  getProposalStatusBadgeVariant,
  getProposalStatusLabel,
} from "./helpers";

type ViewProposalSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: ProposalTracking;
};

export function ViewProposalSheet({
  open,
  onOpenChange,
  proposal,
}: ViewProposalSheetProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="flex flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{proposal.jobTitle || "Proposal Details"}</SheetTitle>
          <SheetDescription>
            Sent on {format(new Date(proposal.sentAt), "MMMM dd, yyyy")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <section className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm">Status</h3>
              <div className="mt-1">
                <Badge
                  variant={getProposalStatusBadgeVariant(
                    proposal.currentOutcome
                  )}
                >
                  {getProposalStatusLabel(proposal.currentOutcome)}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm">Platform</h3>
              <div className="mt-1 text-sm">{proposal.platform || "-"}</div>
            </div>
          </section>

          {proposal.proposalLength && (
            <section>
              <h3 className="font-medium text-sm">Word Count</h3>
              <div className="mt-1 text-sm">
                {proposal.proposalLength} words
              </div>
            </section>
          )}

          {proposal.proposalContent && (
            <section>
              <h3 className="font-medium text-sm">Proposal Content</h3>
              <article className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                {proposal.proposalContent}
              </article>
            </section>
          )}

          {proposal.notes && (
            <section>
              <h3 className="font-medium text-sm">Notes</h3>
              <aside className="mt-1 rounded-md bg-muted/50 p-3 text-sm">
                {proposal.notes}
              </aside>
            </section>
          )}

          {proposal.jobPostingUrl && (
            <section className="flex flex-col gap-1">
              <h3 className="font-medium text-sm">Job Posting</h3>

              <Button asChild variant={"link"}>
                <a
                  className="!px-0 w-fit underline"
                  href={proposal.jobPostingUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View Original Job Posting
                </a>
              </Button>
            </section>
          )}

          {/* Timeline of events */}
          <section>
            <h3 className="font-medium text-sm">Timeline</h3>
            <dl className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <dt>Proposal sent</dt>
                <dd className="text-muted-foreground">
                  <time dateTime={new Date(proposal.sentAt).toISOString()}>
                    {format(
                      new Date(proposal.sentAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </time>
                </dd>
              </div>

              {proposal.viewedAt && (
                <div className="flex justify-between text-sm">
                  <dt>Proposal viewed</dt>
                  <dd className="text-muted-foreground">
                    <time dateTime={new Date(proposal.viewedAt).toISOString()}>
                      {format(
                        new Date(proposal.viewedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </time>
                  </dd>
                </div>
              )}

              {proposal.respondedAt && (
                <div className="flex justify-between text-sm">
                  <dt>Client responded</dt>
                  <dd className="text-muted-foreground">
                    <time
                      dateTime={new Date(proposal.respondedAt).toISOString()}
                    >
                      {format(
                        new Date(proposal.respondedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </time>
                  </dd>
                </div>
              )}

              {proposal.interviewedAt && (
                <div className="flex justify-between text-sm">
                  <dt>Interview scheduled</dt>
                  <dd className="text-muted-foreground">
                    <time
                      dateTime={new Date(proposal.interviewedAt).toISOString()}
                    >
                      {format(
                        new Date(proposal.interviewedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </time>
                  </dd>
                </div>
              )}

              {proposal.completedAt && (
                <div className="flex justify-between text-sm">
                  <dt>Final outcome</dt>
                  <dd className="text-muted-foreground">
                    <time
                      dateTime={new Date(proposal.completedAt).toISOString()}
                    >
                      {format(
                        new Date(proposal.completedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </time>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
