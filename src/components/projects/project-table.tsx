"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown, Filter, Plus, Search, Settings2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { createColumns } from "@/components/projects/columns";
import { CreateProjectSheet } from "@/components/projects/create-project-sheet";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { UpdateProjectSheet } from "@/components/projects/update-project-sheet";
import { ViewProjectSheet } from "@/components/projects/view-project-sheet";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_TYPE, type Project } from "@/db";
import { useProjectActions } from "@/hooks/use-project-actions";

export default function ProjectsPageTable({
  projects,
  isLoading,
}: {
  projects: Project[];
  isLoading?: boolean;
}) {
  const { handleCopyId } = useProjectActions();

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showViewProject, setShowViewProject] = useState(false);
  const [showUpdateProject, setShowUpdateProject] = useState(false);
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleViewProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowViewProject(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowUpdateProject(true);
  }, []);

  const handleDeleteProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowDeleteProject(true);
  }, []);

  const columns = useMemo(
    () =>
      createColumns({
        onView: handleViewProject,
        onEdit: handleEditProject,
        onDelete: handleDeleteProject,
        onCopy: handleCopyId,
      }),
    [handleCopyId, handleViewProject, handleEditProject, handleDeleteProject],
  );

  return (
    <>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={projects}
            isLoading={isLoading}
            onRowClick={(project) => {
              setSelectedProject(project);
              setShowViewProject(true);
            }}
            tableHeader={(table) => (
              <ProjectTableHeader
                table={table}
                onNewProject={() => setShowCreateProject(true)}
              />
            )}
          />
        </CardContent>
      </Card>

      <CreateProjectSheet
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />

      {selectedProject && (
        <>
          <ViewProjectSheet
            project={selectedProject}
            open={showViewProject}
            onOpenChange={setShowViewProject}
            key={`${selectedProject.id}view`}
          />

          <UpdateProjectSheet
            project={selectedProject}
            open={showUpdateProject}
            onOpenChange={setShowUpdateProject}
            key={`${selectedProject.id}update`}
          />

          <DeleteProjectDialog
            project={selectedProject}
            open={showDeleteProject}
            onOpenChange={setShowDeleteProject}
            key={`${selectedProject.id}delete`}
          />
        </>
      )}
    </>
  );
}

// Project table header component
function ProjectTableHeader<TData>({
  table,
  onNewProject,
}: {
  table: Table<TData>;
  onNewProject?: () => void;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-2">
      {/* Search - always visible */}
      <div className="relative flex-1 xl:flex-initial">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          className="pl-8 md:max-w-sm"
        />
      </div>

      {/* Desktop filters - hidden on mobile */}
      <div className="hidden xl:flex items-center space-x-2">
        <TypeFilter table={table} className="w-[180px]" />
        <CategoryFilter table={table} className="w-[180px]" />
        <ColumnVisibilityDropdown table={table} />

        {/* New project button */}
        {onNewProject && (
          <Button onClick={onNewProject}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Mobile actions */}
      <div className="flex items-center gap-2 xl:hidden">
        {/* Add Project button - mobile only */}
        {onNewProject && (
          <Button
            onClick={onNewProject}
            size="icon"
            variant="outline"
            aria-label="Create new project"
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
            <div className="p-4 space-y-4">
              <TypeFilter table={table} showLabel />
              <CategoryFilter table={table} showLabel />

              {onNewProject && (
                <Button onClick={onNewProject} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}

// Reusable filter components
function TypeFilter<TData>({
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
      {showLabel && <div className="text-sm font-medium">Type</div>}
      <Select
        value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
        onValueChange={(value) =>
          table.getColumn("type")?.setFilterValue(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className={className}>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="All types" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {PROJECT_TYPE.map((type) => (
            <SelectItem key={type} value={type} className="capitalize">
              {type.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

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
          <SelectItem value="mobile app">Mobile App</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="consulting">Consulting</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ColumnVisibilityDropdown<TData>({ table }: { table: Table<TData> }) {
  return (
    <div>
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
    </div>
  );
}
