"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown, Filter, Search, Settings2 } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deactivateWaitlistEntry,
  reactivateWaitlistEntry,
} from "@/actions/waitlist-actions";
import { Button } from "@/components/ui/button";
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
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { createColumns } from "@/components/waitlist/columns";
import { useClipboard } from "@/hooks/use-clipboard";
import type { Waitlist } from "@/lib/db/schema/waitlist";
import type { PageMetadata } from "@/lib/types";
import { DeleteWaitlistDialog } from "./delete-waitlist-dialog";

type WaitlistTableProps = {
  entries: Waitlist[];
  pagination?: PageMetadata;
};

export function WaitlistTable({ entries, pagination }: WaitlistTableProps) {
  const { copy } = useClipboard();
  const [isPending, startTransition] = useTransition();
  const [selectedEntry, setSelectedEntry] = useState<Waitlist | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCopy = useCallback(
    (value: string) => {
      copy(value);
    },
    [copy]
  );

  const handleToggleActive = useCallback((entry: Waitlist) => {
    startTransition(async () => {
      try {
        if (entry.isActive) {
          await deactivateWaitlistEntry(entry.email);
          toast.success("Waitlist entry deactivated");
        } else {
          await reactivateWaitlistEntry(entry.email);
          toast.success("Waitlist entry activated");
        }
      } catch {
        toast.error("Failed to update entry status");
      }
    });
  }, []);

  const handleDelete = useCallback((entry: Waitlist) => {
    setSelectedEntry(entry);
    setShowDeleteDialog(true);
  }, []);

  const columns = useMemo(
    () =>
      createColumns({
        onCopy: handleCopy,
        onToggleActive: handleToggleActive,
        onDelete: handleDelete,
      }),
    [handleCopy, handleToggleActive, handleDelete]
  );

  return (
    <>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={entries}
            enablePagination={false}
            isLoading={isPending} // Disable client-side pagination
            tableHeader={(table) => <WaitlistTableHeader table={table} />}
          />
          {!!pagination?.totalPages && <Pagination {...pagination} />}
        </CardContent>
      </Card>

      {selectedEntry && (
        <DeleteWaitlistDialog
          entry={selectedEntry}
          onOpenChange={setShowDeleteDialog}
          open={showDeleteDialog}
        />
      )}
    </>
  );
}

// Waitlist table header component
function WaitlistTableHeader<TData>({ table }: { table: Table<TData> }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    const column = table.getColumn("isActive");
    if (!column) {
      return;
    }

    if (value === "all") {
      column.setFilterValue(undefined);
    } else if (value === "active") {
      column.setFilterValue(true);
    } else if (value === "inactive") {
      column.setFilterValue(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            placeholder="Search emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="hidden md:flex" size="sm" variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[160px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              onValueChange={handleStatusFilterChange}
              value={statusFilter}
            >
              <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="active">
                Active
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="inactive">
                Inactive
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Drawer>
          <DrawerTrigger asChild>
            <Button className="md:hidden" size="icon" variant="outline">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 p-4">
              {/* Mobile Status Filter */}
              <div className="space-y-2">
                <div className="font-medium text-sm">Status</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="w-full justify-between"
                      variant="outline"
                    >
                      {statusFilter === "all"
                        ? "All"
                        : statusFilter === "active"
                          ? "Active"
                          : "Inactive"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-full">
                    <DropdownMenuRadioGroup
                      onValueChange={handleStatusFilterChange}
                      value={statusFilter}
                    >
                      <DropdownMenuRadioItem value="all">
                        All
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="active">
                        Active
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="inactive">
                        Inactive
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ColumnVisibilityDropdown table={table} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:block">
          <ColumnVisibilityDropdown table={table} />
        </div>
      </div>
    </div>
  );
}

// Column visibility dropdown component
function ColumnVisibilityDropdown<TData>({ table }: { table: Table<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          Columns
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
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
  );
}
