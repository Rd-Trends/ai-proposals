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
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProposalTracking } from "@/lib/db/schema/proposals";
import type { PageMetadata } from "@/lib/types";
import { Button } from "../ui/button";

export default function ProposalsTrackingTable({
  proposals,
  pagination,
  isLoading,
}: {
  proposals: ProposalTracking[];
  pagination?: PageMetadata;
  isLoading?: boolean;
}) {
  const [selectedProposal, setSelectedProposal] =
    useState<ProposalTracking | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const columns = useMemo(
    () =>
      createProposalColumns({
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
      }),
    []
  );

  return (
    <>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={proposals}
            emptyMessage="No proposals found."
            enablePagination={false} // Disable client-side pagination
            isLoading={isLoading}
            onRowClick={(proposal: ProposalTracking) => {
              setSelectedProposal(proposal);
              setShowViewDialog(true);
            }}
            tableHeader={(table) => <ProposalTableHeader table={table} />}
          />
          {/* Server-side pagination */}
          {!!pagination?.totalPages && (
            <Pagination
              className="mt-4"
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              totalPages={pagination.totalPages}
            />
          )}
        </CardContent>
      </Card>

      {selectedProposal && (
        <>
          <ViewProposalSheet
            key={`${selectedProposal.id}view`}
            onOpenChange={setShowViewDialog}
            open={showViewDialog}
            proposal={selectedProposal}
          />
          <UpdateProposalStatusDialog
            key={`${selectedProposal.id}update`}
            onOpenChange={setShowUpdateDialog}
            open={showUpdateDialog}
            proposal={selectedProposal}
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
      {showLabel && <div className="font-medium text-sm">Status</div>}
      <Select
        onValueChange={(value) =>
          table
            .getColumn("currentOutcome")
            ?.setFilterValue(value === "all" ? "" : value)
        }
        value={
          (table.getColumn("currentOutcome")?.getFilterValue() as string) ?? ""
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
      {showLabel && <div className="font-medium text-sm">Platform</div>}
      <Select
        onValueChange={(value) =>
          table
            .getColumn("platform")
            ?.setFilterValue(value === "all" ? "" : value)
        }
        value={(table.getColumn("platform")?.getFilterValue() as string) ?? ""}
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
      {showLabel && <div className="font-medium text-sm">Columns</div>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={className} variant="outline">
            <span className="mr-2">Columns</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                checked={column.getIsVisible()}
                className="capitalize"
                key={column.id}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
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
        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8 md:max-w-sm"
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          placeholder="Search proposals..."
          value={(table.getState().globalFilter as string) ?? ""}
        />
      </div>

      {/* Desktop filters - hidden on mobile */}
      <div className="hidden items-center space-x-2 xl:flex">
        <StatusFilter className="w-[160px]" table={table} />
        <PlatformFilter className="w-[140px]" table={table} />
        <ColumnVisibilityDropdown table={table} />
      </div>

      {/* Mobile actions */}
      <Drawer onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            aria-label="Open filters and actions"
            className="xl:hidden"
            size="icon"
            variant="outline"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters & Actions</DrawerTitle>
          </DrawerHeader>
          <section className="space-y-4 p-4">
            <StatusFilter className="w-full" showLabel table={table} />
            <PlatformFilter className="w-full" showLabel table={table} />
            <ColumnVisibilityDropdown
              className="w-full justify-between"
              showLabel
              table={table}
            />
          </section>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
