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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTemplateActions } from "@/hooks/use-template-actions";
import { TEMPLATE_STATUS, type Template } from "@/lib/db";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

export default function TemplatesPageTable({
  templates,
  isLoading,
}: {
  templates: Template[];
  isLoading?: boolean;
}) {
  const { handleDuplicateTemplate, handleToggleFavorite, handleCopyId } =
    useTemplateActions();

  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showViewTemplate, setShowViewTemplate] = useState(false);
  const [showUpdateTemplate, setShowUpdateTemplate] = useState(false);
  const [showDeleteTemplate, setShowDeleteTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  const columns = useMemo(() => {
    return createColumns({
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
    });
  }, [handleCopyId, handleDuplicateTemplate, handleToggleFavorite]);

  return (
    <>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={templates}
            isLoading={isLoading}
            onRowClick={(template) => {
              setSelectedTemplate(template);
              setShowViewTemplate(true);
            }}
            tableHeader={(table) => (
              <TemplateTableHeader
                table={table}
                onNewTemplate={() => setShowCreateTemplate(true)}
              />
            )}
            emptyMessage="No templates found."
          />
        </CardContent>
      </Card>

      <CreateTemplateSheet
        open={showCreateTemplate}
        onOpenChange={setShowCreateTemplate}
      />

      {selectedTemplate && (
        <>
          <ViewTemplateSheet
            open={showViewTemplate}
            onOpenChange={setShowViewTemplate}
            template={selectedTemplate}
            key={`${selectedTemplate.id}view`}
          />

          <UpdateTemplateSheet
            open={showUpdateTemplate}
            onOpenChange={setShowUpdateTemplate}
            template={selectedTemplate}
            key={`${selectedTemplate.id}update`}
          />

          <DeleteTemplateDialog
            open={showDeleteTemplate}
            onOpenChange={setShowDeleteTemplate}
            template={selectedTemplate}
            key={`${selectedTemplate.id}delete`}
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
      {showLabel && <div className="text-sm font-medium">Category</div>}
      <Select
        value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
        onValueChange={(value) =>
          table
            .getColumn("category")
            ?.setFilterValue(value === "all" ? "" : value)
        }
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
      {showLabel && <div className="text-sm font-medium">Status</div>}
      <Select
        value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
        onValueChange={(value) =>
          table
            .getColumn("status")
            ?.setFilterValue(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          {TEMPLATE_STATUS.map((status) => (
            <SelectItem key={status} value={status} className="capitalize">
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
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          className="pl-8 md:max-w-sm"
        />
      </div>

      {/* Desktop filters - hidden on mobile */}
      <div className="hidden xl:flex items-center space-x-2">
        <CategoryFilter table={table} className="w-[180px]" />
        <StatusFilter table={table} className="w-[140px]" />
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
            onClick={onNewTemplate}
            size="icon"
            variant="outline"
            aria-label="Create new template"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Drawer for filters - mobile only */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open filters and actions"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters & Actions</DrawerTitle>
            </DrawerHeader>
            <section className="p-4 space-y-4">
              <CategoryFilter table={table} className="w-full" showLabel />
              <StatusFilter table={table} className="w-full" showLabel />
              <ColumnVisibilityDropdown
                table={table}
                className="w-full justify-between"
                showLabel
              />

              {/* New template button in drawer */}
              {onNewTemplate && (
                <Button onClick={onNewTemplate} className="w-full">
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
