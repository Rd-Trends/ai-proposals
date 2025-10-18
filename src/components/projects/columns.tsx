"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDistance } from "date-fns";
import {
  Copy,
  ExternalLink,
  Eye,
  Github,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project, ProjectType } from "@/db";

export type ProjectColumnProps = {
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onCopy: (id: string) => void;
};

export const createColumns = ({
  onView,
  onEdit,
  onDelete,
  onCopy,
}: ProjectColumnProps): ColumnDef<Project>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{project.title}</span>
          {project.summary && (
            <span className="text-sm text-muted-foreground line-clamp-1">
              {project.summary}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as ProjectType;
      const typeLabels: Record<ProjectType, string> = {
        case_study: "Case Study",
        client_work: "Client Work",
        personal_project: "Personal",
      };
      return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return category ? (
        <Badge variant="secondary">{category}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "urls",
    header: "Links",
    cell: ({ row }) => {
      const urls = row.getValue("urls") as { title: string; url: string }[];
      if (!urls || urls.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex gap-1">
          {urls.slice(0, 2).map((link) => (
            <Button
              key={link.url}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              asChild
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                {link.title.toLowerCase().includes("github") ? (
                  <Github className="h-3 w-3" />
                ) : (
                  <ExternalLink className="h-3 w-3" />
                )}
                {link.title}
              </a>
            </Button>
          ))}
          {urls.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{urls.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "completedAt",
    header: "Completed",
    cell: ({ row }) => {
      const completedAt = row.getValue("completedAt") as Date | null;
      return completedAt ? (
        <span className="text-sm">
          {formatDistance(completedAt, new Date(), { addSuffix: true })}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as Date;
      return (
        <span className="text-sm">
          {formatDistance(updatedAt, new Date(), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onCopy(project.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy project ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(project)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
