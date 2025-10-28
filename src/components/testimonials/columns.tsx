"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDistance } from "date-fns";
import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import type { Testimonial } from "@/lib/db";

export type TestimonialColumnProps = {
  onView: (testimonial: Testimonial) => void;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
  onCopy: (id: string) => void;
};

export const createColumns = ({
  onView,
  onEdit,
  onDelete,
  onCopy,
}: TestimonialColumnProps): ColumnDef<Testimonial>[] => [
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
    accessorKey: "clientName",
    header: "Client",
    cell: ({ row }) => {
      const testimonial = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{testimonial.clientName}</span>
          {testimonial.clientTitle && (
            <span className="text-sm text-muted-foreground">
              {testimonial.clientTitle}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "content",
    header: "Testimonial",
    cell: ({ row }) => {
      const content = row.getValue("content") as string;
      return (
        <div className="max-w-md">
          <span className="text-sm line-clamp-2">{content}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "projectTitle",
    header: "Project",
    cell: ({ row }) => {
      const projectTitle = row.getValue("projectTitle") as string | null;
      return projectTitle ? (
        <span className="text-sm">{projectTitle}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date;
      return (
        <span className="text-sm">
          {formatDistance(createdAt, new Date(), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const testimonial = row.original;

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
            <DropdownMenuItem onClick={() => onCopy(testimonial.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy testimonial ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(testimonial)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(testimonial)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit testimonial
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(testimonial)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete testimonial
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
