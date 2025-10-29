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
import type { Project } from "@/lib/db";
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
            enablePagination={false} // Disable client-side pagination
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
            emptyMessage="No projects found."
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
            variant="outline"
            aria-label="Create new project"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Project</span>
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
