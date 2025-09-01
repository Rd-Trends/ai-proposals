"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown, Filter, Plus, Search } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEMPLATE_STATUS, type Template } from "@/db";
import { useTemplateActions } from "@/hooks/use-template-actions";

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
        <CardContent className="p-6 w-">
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
          />

          <UpdateTemplateSheet
            open={showUpdateTemplate}
            onOpenChange={setShowUpdateTemplate}
            template={selectedTemplate}
          />

          <DeleteTemplateDialog
            open={showDeleteTemplate}
            onOpenChange={setShowDeleteTemplate}
            template={selectedTemplate}
          />
        </>
      )}
    </>
  );
}

function TemplateTableHeader<TData>({
  table,
  onNewTemplate,
}: {
  table: Table<TData>;
  onNewTemplate?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) =>
              table.setGlobalFilter(String(event.target.value))
            }
            className="pl-8 max-w-sm"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={
            (table.getColumn("category")?.getFilterValue() as string) ?? ""
          }
          onValueChange={(value) =>
            table
              .getColumn("category")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All categories" />
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

        {/* Status Filter */}
        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[140px]">
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

        {/* New template button */}
        {onNewTemplate && (
          <Button onClick={onNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        )}
      </div>
    </div>
  );
}
