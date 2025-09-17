"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { ChevronDown, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { createProposalColumns } from "@/components/proposals/columns";
import { UpdateProposalStatusDialog } from "@/components/proposals/update-proposal-status-dialog";
import { ViewProposalSheet } from "@/components/proposals/view-proposal-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProposalTracking } from "@/db";
import { Button } from "../ui/button";

export default function ProposalsTrackingTable({
  proposals,
  isLoading,
}: {
  proposals: ProposalTracking[];
  isLoading?: boolean;
}) {
  const [selectedProposal, setSelectedProposal] =
    useState<ProposalTracking | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const columns = useMemo(() => {
    return createProposalColumns({
      onView: (proposal) => {
        setSelectedProposal(proposal);
        setShowViewDialog(true);
      },
      onUpdateStatus: (proposal) => {
        setSelectedProposal(proposal);
        setShowUpdateDialog(true);
      },
      onViewJobPosting: (proposal) => {
        if (proposal.jobPostingUrl) {
          window.open(proposal.jobPostingUrl, "_blank");
        }
      },
    });
  }, []);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={proposals}
            isLoading={isLoading}
            onRowClick={(proposal: ProposalTracking) => {
              setSelectedProposal(proposal);
              setShowViewDialog(true);
            }}
            tableHeader={(table) => <ProposalTableHeader table={table} />}
            emptyMessage="No proposals found."
          />
        </CardContent>
      </Card>

      {/* View Proposal Sheet */}
      {selectedProposal && (
        <>
          <ViewProposalSheet
            open={showViewDialog}
            onOpenChange={setShowViewDialog}
            proposal={selectedProposal}
          />
          <UpdateProposalStatusDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            proposal={selectedProposal}
          />
        </>
      )}
    </>
  );
}

function ProposalTableHeader({
  table,
}: {
  table: TanStackTable<ProposalTracking>;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) =>
              table.setGlobalFilter(String(event.target.value))
            }
            className="pl-8 max-w-sm"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={
            (table.getColumn("currentOutcome")?.getFilterValue() as string) ??
            ""
          }
          onValueChange={(value) =>
            table
              .getColumn("currentOutcome")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="proposal_sent">Sent</SelectItem>
            <SelectItem value="proposal_viewed">Viewed</SelectItem>
            <SelectItem value="client_responded">Response</SelectItem>
            <SelectItem value="interviewed">Interview</SelectItem>
            <SelectItem value="job_awarded">Awarded</SelectItem>
            <SelectItem value="proposal_rejected">Rejected</SelectItem>
            <SelectItem value="no_response">No Response</SelectItem>
          </SelectContent>
        </Select>

        {/* Platform Filter */}
        <Select
          value={
            (table.getColumn("platform")?.getFilterValue() as string) ?? ""
          }
          onValueChange={(value) =>
            table
              .getColumn("platform")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            <SelectItem value="upwork">Upwork</SelectItem>
            <SelectItem value="freelancer">Freelancer</SelectItem>
            <SelectItem value="fiverr">Fiverr</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
