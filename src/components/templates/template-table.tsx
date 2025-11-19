"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown, Filter, Plus, Search, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createColumns } from "@/components/templates/columns";
import { CreateTemplateSheet } from "@/components/templates/create-template-sheet";
import { DeleteTemplateDialog } from "@/components/templates/delete-template-dialog";
import { UpdateTemplateSheet } from "@/components/templates/update-template-sheet";
import { ViewTemplateSheet } from "@/components/templates/view-template-sheet";
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
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTemplateActions } from "@/hooks/use-template-actions";
import { TEMPLATE_STATUS, type Template } from "@/lib/db/schema/templates";
import type { PageMetadata } from "@/lib/types";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

export default function TemplatesPageTable({
  templates,
  pagination,
  isLoading,
}: {
  templates: Template[];
  pagination?: PageMetadata;
  isLoading?: boolean;
}) {
  const { handleDuplicateTemplate, handleToggleFavorite, handleCopyId } =
    useTemplateActions();

  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showViewTemplate, setShowViewTemplate] = useState(false);
  const [showUpdateTemplate, setShowUpdateTemplate] = useState(false);
  const [showDeleteTemplate, setShowDeleteTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const columns = useMemo(
    () =>
      createColumns({
        onView: (template) => {
          setSelectedTemplate(template);
          setShowViewTemplate(true);
        },
        onEdit: (template) => {
          setSelectedTemplate(template);
          setShowUpdateTemplate(true);
        },
        onDuplicate: (template) => {
          handleDuplicateTemplate(template);
        },
        onDelete: (template) => {
          setSelectedTemplate(template);
          setShowDeleteTemplate(true);
        },
        onToggleFavorite: (template) => {
          handleToggleFavorite(template);
        },
        onCopyId: (template) => {
          handleCopyId(template);
        },
      }),
    [handleCopyId, handleDuplicateTemplate, handleToggleFavorite]
  );

  return (
    <>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={templates}
            emptyMessage="No templates found."
            enablePagination={false} // Disable client-side pagination
            isLoading={isLoading}
            onRowClick={(template) => {
              setSelectedTemplate(template);
              setShowViewTemplate(true);
            }}
            tableHeader={(table) => (
              <TemplateTableHeader
                onNewTemplate={() => setShowCreateTemplate(true)}
                table={table}
              />
            )}
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

      <CreateTemplateSheet
        onOpenChange={setShowCreateTemplate}
        open={showCreateTemplate}
      />

      {selectedTemplate && (
        <>
          <ViewTemplateSheet
            key={`${selectedTemplate.id}view`}
            onOpenChange={setShowViewTemplate}
            open={showViewTemplate}
            template={selectedTemplate}
          />

          <UpdateTemplateSheet
            key={`${selectedTemplate.id}update`}
            onOpenChange={setShowUpdateTemplate}
            open={showUpdateTemplate}
            template={selectedTemplate}
          />

          <DeleteTemplateDialog
            key={`${selectedTemplate.id}delete`}
            onOpenChange={setShowDeleteTemplate}
            open={showDeleteTemplate}
            template={selectedTemplate}
          />
        </>
      )}
    </>
  );
}

// Reusable filter components
function CategoryFilter<TData>({
  table,
  className,
  showLabel = false,
}: {
  table: Table<TData>;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={showLabel ? "space-y-2" : ""}>
      {showLabel && <div className="font-medium text-sm">Category</div>}
      <Select
        onValueChange={(value) =>
          table
            .getColumn("category")
            ?.setFilterValue(value === "all" ? "" : value)
        }
        value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
      >
        <SelectTrigger className={className}>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="All categories" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectItem value="web development">Web Development</SelectItem>
          <SelectItem value="writing">Writing</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="consulting">Consulting</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function StatusFilter<TData>({
  table,
  className,
  showLabel = false,
}: {
  table: Table<TData>;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={showLabel ? "space-y-2" : ""}>
      {showLabel && <div className="font-medium text-sm">Status</div>}
      <Select
        onValueChange={(value) =>
          table
            .getColumn("status")
            ?.setFilterValue(value === "all" ? "" : value)
        }
        value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          {TEMPLATE_STATUS.map((status) => (
            <SelectItem className="capitalize" key={status} value={status}>
              {status.split("_").join(" ")}
            </SelectItem>
          ))}
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
  table: Table<TData>;
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

function TemplateTableHeader<TData>({
  table,
  onNewTemplate,
}: {
  table: Table<TData>;
  onNewTemplate?: () => void;
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
          placeholder="Search templates..."
          value={(table.getState().globalFilter as string) ?? ""}
        />
      </div>

      {/* Desktop filters - hidden on mobile */}
      <div className="hidden items-center space-x-2 xl:flex">
        <CategoryFilter className="w-[180px]" table={table} />
        <StatusFilter className="w-[140px]" table={table} />
        <ColumnVisibilityDropdown table={table} />

        {/* New template button */}
        {onNewTemplate && (
          <Button onClick={onNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        )}
      </div>

      {/* Mobile actions */}
      <div className="flex items-center gap-2 xl:hidden">
        {/* Add Template button - mobile only */}
        {onNewTemplate && (
          <Button
            aria-label="Create new template"
            onClick={onNewTemplate}
            size="icon"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Drawer for filters - mobile only */}
        <Drawer onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              aria-label="Open filters and actions"
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
              <CategoryFilter className="w-full" showLabel table={table} />
              <StatusFilter className="w-full" showLabel table={table} />
              <ColumnVisibilityDropdown
                className="w-full justify-between"
                showLabel
                table={table}
              />

              {/* New template button in drawer */}
              {onNewTemplate && (
                <Button className="w-full" onClick={onNewTemplate}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              )}
            </section>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}
