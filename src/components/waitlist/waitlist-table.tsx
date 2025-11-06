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
import type { Waitlist } from "@/lib/db";
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
    [copy],
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
    [handleCopy, handleToggleActive, handleDelete],
  );

  return (
    <>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={entries}
            isLoading={isPending}
            enablePagination={false} // Disable client-side pagination
            tableHeader={(table) => <WaitlistTableHeader table={table} />}
          />
          {!!pagination?.totalPages && <Pagination {...pagination} />}
        </CardContent>
      </Card>

      {selectedEntry && (
        <DeleteWaitlistDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          entry={selectedEntry}
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
    if (!column) return;

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
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Filter className="mr-2 h-4 w-4" />
              Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[160px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
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
            <Button variant="outline" size="icon" className="md:hidden">
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
                <div className="text-sm font-medium">Status</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
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
                      value={statusFilter}
                      onValueChange={handleStatusFilterChange}
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
        <Button variant="outline" size="sm">
          Columns
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
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
  );
}
