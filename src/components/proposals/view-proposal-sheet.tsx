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
import type { ProposalTracking } from "@/db";
import { Button } from "../ui/button";
import {
  getProposalStatusBadgeVariant,
  getProposalStatusLabel,
} from "./helpers";

interface ViewProposalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: ProposalTracking;
}

export function ViewProposalSheet({
  open,
  onOpenChange,
  proposal,
}: ViewProposalSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className=" sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle>{proposal.jobTitle || "Proposal Details"}</SheetTitle>
          <SheetDescription>
            Sent on {format(new Date(proposal.sentAt), "MMMM dd, yyyy")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 flex-1 overflow-y-auto pb-4">
          <section className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <div className="mt-1">
                <Badge
                  variant={getProposalStatusBadgeVariant(
                    proposal.currentOutcome,
                  )}
                >
                  {getProposalStatusLabel(proposal.currentOutcome)}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">Platform</h3>
              <div className="mt-1 text-sm">{proposal.platform || "-"}</div>
            </div>
          </section>

          {proposal.proposalLength && (
            <section>
              <h3 className="text-sm font-medium">Word Count</h3>
              <div className="mt-1 text-sm">
                {proposal.proposalLength} words
              </div>
            </section>
          )}

          {proposal.proposalContent && (
            <section>
              <h3 className="text-sm font-medium">Proposal Content</h3>
              <article className="mt-1 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {proposal.proposalContent}
              </article>
            </section>
          )}

          {proposal.notes && (
            <section>
              <h3 className="text-sm font-medium">Notes</h3>
              <aside className="mt-1 p-3 bg-muted/50 rounded-md text-sm">
                {proposal.notes}
              </aside>
            </section>
          )}

          {proposal.jobPostingUrl && (
            <section className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">Job Posting</h3>

              <Button variant={"link"} asChild>
                <a
                  className="w-fit !px-0 underline"
                  href={proposal.jobPostingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Original Job Posting
                </a>
              </Button>
            </section>
          )}

          {/* Timeline of events */}
          <section>
            <h3 className="text-sm font-medium">Timeline</h3>
            <dl className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <dt>Proposal sent</dt>
                <dd className="text-muted-foreground">
                  <time dateTime={new Date(proposal.sentAt).toISOString()}>
                    {format(
                      new Date(proposal.sentAt),
                      "MMM dd, yyyy 'at' h:mm a",
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
                        "MMM dd, yyyy 'at' h:mm a",
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
                        "MMM dd, yyyy 'at' h:mm a",
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
                        "MMM dd, yyyy 'at' h:mm a",
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
                        "MMM dd, yyyy 'at' h:mm a",
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
