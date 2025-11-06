"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Check,
  Copy,
  Mail,
  MoreHorizontal,
  Power,
  PowerOff,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Waitlist } from "@/lib/db";

type ColumnActions = {
  onCopy: (id: string) => void;
  onToggleActive: (entry: Waitlist) => void;
  onDelete: (entry: Waitlist) => void;
};

export function createColumns({
  onCopy,
  onToggleActive,
  onDelete,
}: ColumnActions): ColumnDef<Waitlist>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {row.getValue("email")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "invitedBy",
      header: "Invited By",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("invitedBy") || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "invitedAt",
      header: "Invited At",
      cell: ({ row }) => {
        const date = row.getValue("invitedAt") as Date;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        const usedAt = row.original.usedAt;

        if (usedAt) {
          return (
            <Badge
              variant="default"
              className="gap-1 bg-green-600 hover:bg-green-600/90"
            >
              <Check className="h-3 w-3" />
              Used
            </Badge>
          );
        }

        return isActive ? (
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <X className="h-3 w-3" />
            Inactive
          </Badge>
        );
      },
    },
    {
      accessorKey: "usedAt",
      header: "Used At",
      cell: ({ row }) => {
        const date = row.getValue("usedAt") as Date | null;
        return date ? (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), "MMM dd, yyyy")}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Not used</span>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string | null;
        return (
          <span className="text-sm text-muted-foreground line-clamp-1">
            {notes || "—"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const entry = row.original;

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
              <DropdownMenuItem onClick={() => onCopy(entry.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(entry.email)}>
                <Mail className="mr-2 h-4 w-4" />
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleActive(entry)}>
                {entry.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(entry)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
