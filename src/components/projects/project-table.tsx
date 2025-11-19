"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown, Plus, Search, Settings2 } from "lucide-react";
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
import { Pagination } from "@/components/ui/pagination";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { Project } from "@/lib/db/schema/projects";
import type { PageMetadata } from "@/lib/types";

export default function ProjectsPageTable({
  projects,
  pagination,
  isLoading,
}: {
  projects: Project[];
  pagination?: PageMetadata;
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
    [handleCopyId, handleViewProject, handleEditProject, handleDeleteProject]
  );

  return (
    <>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={projects}
            emptyMessage="No projects found."
            enablePagination={false} // Disable client-side pagination
            isLoading={isLoading}
            onRowClick={(project) => {
              setSelectedProject(project);
              setShowViewProject(true);
            }}
            tableHeader={(table) => (
              <ProjectTableHeader
                onNewProject={() => setShowCreateProject(true)}
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

      <CreateProjectSheet
        onOpenChange={setShowCreateProject}
        open={showCreateProject}
      />

      {selectedProject && (
        <>
          <ViewProjectSheet
            key={`${selectedProject.id}-view`}
            onOpenChange={setShowViewProject}
            open={showViewProject}
            project={selectedProject}
          />

          <UpdateProjectSheet
            key={`${selectedProject.id}-update`}
            onOpenChange={setShowUpdateProject}
            open={showUpdateProject}
            project={selectedProject}
          />

          <DeleteProjectDialog
            key={`${selectedProject.id}-delete`}
            onOpenChange={setShowDeleteProject}
            open={showDeleteProject}
            project={selectedProject}
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
        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8 md:max-w-sm"
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          placeholder="Search projects..."
          value={(table.getState().globalFilter as string) ?? ""}
        />
      </div>

      {/* Desktop filters - hidden on mobile */}
      <div className="hidden items-center space-x-2 xl:flex">
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
            aria-label="Create new project"
            onClick={onNewProject}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Project</span>
          </Button>
        )}

        {/* Column visibility - mobile only */}
        <Drawer onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              aria-label="Open column visibility"
              size="icon"
              variant="outline"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Column Visibility</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 p-4">
              <ColumnVisibilityDropdown table={table} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}

function ColumnVisibilityDropdown<TData>({ table }: { table: Table<TData> }) {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="ml-auto" variant="outline">
            Columns <ChevronDown className="ml-2 h-4 w-4" />
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
