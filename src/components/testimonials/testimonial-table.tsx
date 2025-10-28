"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown, Plus, Search, Settings2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { createColumns } from "@/components/testimonials/columns";
import { CreateTestimonialSheet } from "@/components/testimonials/create-testimonial-sheet";
import { DeleteTestimonialDialog } from "@/components/testimonials/delete-testimonial-dialog";
import { UpdateTestimonialSheet } from "@/components/testimonials/update-testimonial-sheet";
import { ViewTestimonialSheet } from "@/components/testimonials/view-testimonial-sheet";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useClipboard } from "@/hooks/use-clipboard";
import type { Testimonial } from "@/lib/db";

export default function TestimonialsTable({
  testimonials,
  isLoading,
}: {
  testimonials: Testimonial[];
  isLoading?: boolean;
}) {
  const { copy } = useClipboard();

  const [showCreateTestimonial, setShowCreateTestimonial] = useState(false);
  const [showViewTestimonial, setShowViewTestimonial] = useState(false);
  const [showUpdateTestimonial, setShowUpdateTestimonial] = useState(false);
  const [showDeleteTestimonial, setShowDeleteTestimonial] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);

  const handleViewTestimonial = useCallback((testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowViewTestimonial(true);
  }, []);

  const handleEditTestimonial = useCallback((testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowUpdateTestimonial(true);
  }, []);

  const handleDeleteTestimonial = useCallback((testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowDeleteTestimonial(true);
  }, []);

  const handleCopyId = useCallback(
    (id: string) => {
      copy(id);
    },
    [copy],
  );

  const columns = useMemo(
    () =>
      createColumns({
        onView: handleViewTestimonial,
        onEdit: handleEditTestimonial,
        onDelete: handleDeleteTestimonial,
        onCopy: handleCopyId,
      }),
    [
      handleCopyId,
      handleViewTestimonial,
      handleEditTestimonial,
      handleDeleteTestimonial,
    ],
  );

  return (
    <>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={testimonials}
            isLoading={isLoading}
            onRowClick={(testimonial) => {
              setSelectedTestimonial(testimonial);
              setShowViewTestimonial(true);
            }}
            tableHeader={(table) => (
              <TestimonialTableHeader
                table={table}
                onNewTestimonial={() => setShowCreateTestimonial(true)}
              />
            )}
          />
        </CardContent>
      </Card>

      <CreateTestimonialSheet
        open={showCreateTestimonial}
        onOpenChange={setShowCreateTestimonial}
      />

      {selectedTestimonial && (
        <>
          <ViewTestimonialSheet
            testimonial={selectedTestimonial}
            open={showViewTestimonial}
            onOpenChange={setShowViewTestimonial}
            key={`${selectedTestimonial?.id}-view`}
          />

          <UpdateTestimonialSheet
            testimonial={selectedTestimonial}
            open={showUpdateTestimonial}
            onOpenChange={setShowUpdateTestimonial}
            key={`${selectedTestimonial?.id}-update`}
          />

          <DeleteTestimonialDialog
            testimonial={selectedTestimonial}
            open={showDeleteTestimonial}
            onOpenChange={setShowDeleteTestimonial}
            key={`${selectedTestimonial?.id}-delete`}
          />
        </>
      )}
    </>
  );
}

// Testimonial table header component
function TestimonialTableHeader<TData>({
  table,
  onNewTestimonial,
}: {
  table: Table<TData>;
  onNewTestimonial?: () => void;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-2">
      {/* Search - always visible */}
      <div className="relative flex-1 xl:flex-initial">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search testimonials..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          className="pl-8 md:max-w-sm"
        />
      </div>

      {/* Desktop filters - hidden on mobile */}
      <div className="hidden xl:flex items-center space-x-2">
        <ColumnVisibilityDropdown table={table} />

        {/* New testimonial button */}
        {onNewTestimonial && (
          <Button onClick={onNewTestimonial}>
            <Plus className="mr-2 h-4 w-4" />
            New Testimonial
          </Button>
        )}
      </div>

      {/* Mobile actions */}
      <div className="flex items-center gap-2 xl:hidden">
        {/* Add Testimonial button - mobile only */}
        {onNewTestimonial && (
          <Button
            onClick={onNewTestimonial}
            variant="outline"
            aria-label="Create new testimonial"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Testimonial</span>
          </Button>
        )}

        {/* Column visibility - mobile only */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open column visibility"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Column Visibility</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <ColumnVisibilityDropdown table={table} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}

// Column visibility dropdown component
function ColumnVisibilityDropdown<TData>({ table }: { table: Table<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
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
