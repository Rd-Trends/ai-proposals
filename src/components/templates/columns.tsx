import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import {
  ArrowUpDown,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Star,
  Trash2,
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
import type { Template } from "@/db";

export const createColumns = ({
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onCopyId,
}: {
  onView: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onToggleFavorite?: (template: Template) => void;
  onCopyId?: (template: Template) => void;
}): ColumnDef<Template>[] => [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       onClick={(e) => e.stopPropagation()} // Prevent row selection
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       onClick={(e) => e.stopPropagation()} // Prevent cell click
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const template = row.original;
      return (
        <div className="flex items-center space-x-2">
          {template.isFavorite && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
          <div className="font-medium">{template.title}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {description || "No description"}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return category ? (
        <Badge variant="secondary" className="capitalize">
          {category}
        </Badge>
      ) : (
        <span className="text-muted-foreground">Uncategorized</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "draft"
                ? "secondary"
                : "outline"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tone",
    header: "Tone",
    cell: ({ row }) => {
      const tone = row.getValue("tone") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {tone}
        </Badge>
      );
    },
  },
  {
    accessorKey: "usageCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Usage
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("usageCount") as number;
      return <div className="text-center font-medium">{count}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      return (
        <div className="text-muted-foreground">{formatDate(date, "PPP")}</div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const template = row.original;

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

            {onView && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView(template);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View template
              </DropdownMenuItem>
            )}

            {onEdit && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(template);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit template
              </DropdownMenuItem>
            )}

            {onDuplicate && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(template);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate template
              </DropdownMenuItem>
            )}

            {onToggleFavorite && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(template);
                }}
              >
                <Star className="mr-2 h-4 w-4" />
                {template.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {onCopyId && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyId(template);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy template ID
              </DropdownMenuItem>
            )}

            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(template);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete template
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
