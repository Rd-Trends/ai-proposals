"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { ChevronDown, Filter, Search, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";

import { createProposalColumns } from "@/components/proposals/columns";
import { UpdateProposalStatusDialog } from "@/components/proposals/update-proposal-status-dialog";
import { ViewProposalSheet } from "@/components/proposals/view-proposal-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
        <CardContent>
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

      {selectedProposal && (
        <>
          <ViewProposalSheet
            open={showViewDialog}
            onOpenChange={setShowViewDialog}
            proposal={selectedProposal}
            key={`${selectedProposal.id}view`}
          />
          <UpdateProposalStatusDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            proposal={selectedProposal}
            key={`${selectedProposal.id}update`}
          />
        </>
      )}
    </>
  );
}

function StatusFilter<TData>({
  table,
  className,
  showLabel = false,
}: {
  table: TanStackTable<TData>;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={showLabel ? "space-y-2" : ""}>
      {showLabel && <div className="text-sm font-medium">Status</div>}
      <Select
        value={
          (table.getColumn("currentOutcome")?.getFilterValue() as string) ?? ""
        }
        onValueChange={(value) =>
          table
            .getColumn("currentOutcome")
            ?.setFilterValue(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className={className}>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="All statuses" />
          </div>
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
    </div>
  );
}

function PlatformFilter<TData>({
  table,
  className,
  showLabel = false,
}: {
  table: TanStackTable<TData>;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={showLabel ? "space-y-2" : ""}>
      {showLabel && <div className="text-sm font-medium">Platform</div>}
      <Select
        value={(table.getColumn("platform")?.getFilterValue() as string) ?? ""}
        onValueChange={(value) =>
          table
            .getColumn("platform")
            ?.setFilterValue(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className={className}>
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
  );
}

function ColumnVisibilityDropdown<TData>({
  table,
  className,
  showLabel = false,
}: {
  table: TanStackTable<TData>;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={showLabel ? "space-y-2" : ""}>
      {showLabel && <div className="text-sm font-medium">Columns</div>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <span className="mr-2">Columns</span>
            <ChevronDown className="h-4 w-4" />
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
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ProposalTableHeader({
  table,
}: {
  table: TanStackTable<ProposalTracking>;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-2">
      {/* Search - always visible */}
      <div className="relative flex-1 xl:flex-initial">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search proposals..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          className="pl-8 md:max-w-sm"
        />
      </div>

      {/* Desktop filters - hidden on mobile */}
      <div className="hidden xl:flex items-center space-x-2">
        <StatusFilter table={table} className="w-[160px]" />
        <PlatformFilter table={table} className="w-[140px]" />
        <ColumnVisibilityDropdown table={table} />
      </div>

      {/* Mobile actions */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open filters and actions"
            className="xl:hidden"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters & Actions</DrawerTitle>
          </DrawerHeader>
          <section className="p-4 space-y-4">
            <StatusFilter table={table} className="w-full" showLabel />
            <PlatformFilter table={table} className="w-full" showLabel />
            <ColumnVisibilityDropdown
              table={table}
              className="w-full justify-between"
              showLabel
            />
          </section>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
