import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Eye,
  FileText,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  ProposalOutcome,
  ProposalTracking,
} from "@/lib/db/schema/proposals";
import {
  getProposalStatusBadgeVariant,
  getProposalStatusLabel,
} from "./helpers";

export const createProposalColumns = ({
  onView,
  onUpdateStatus,
  onViewJobPosting,
}: {
  onView: (proposal: ProposalTracking) => void;
  onUpdateStatus: (proposal: ProposalTracking) => void;
  onViewJobPosting?: (proposal: ProposalTracking) => void;
}): ColumnDef<ProposalTracking>[] => [
  {
    accessorKey: "jobTitle",
    header: ({ column }) => (
      <Button
        className="h-8 px-2 lg:px-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Job Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const proposal = row.original;
      return (
        <div className="max-w-[300px] whitespace-normal pl-4 font-medium text-sm">
          {proposal.jobTitle || "Untitled Proposal"}
        </div>
      );
    },
  },
  {
    accessorKey: "currentOutcome",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("currentOutcome") as ProposalOutcome;
      return (
        <Badge variant={getProposalStatusBadgeVariant(status)}>
          {getProposalStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.original.platform;
      return platform ? (
        <Badge className="capitalize" variant="outline">
          {platform}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "sentAt",
    header: ({ column }) => (
      <Button
        className="h-8 px-2 lg:px-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Sent
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <time dateTime={new Date(row.original.sentAt).toISOString()}>
        {format(new Date(row.original.sentAt), "MMM dd, yyyy")}
      </time>
    ),
  },
  {
    accessorKey: "proposalLength",
    header: ({ column }) => (
      <Button
        className="h-8 px-2 lg:px-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Length
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const length = row.getValue("proposalLength") as number;
      return length ? (
        <span>{length} words</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const proposal = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onView(proposal);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(proposal);
              }}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
            {proposal.jobPostingUrl && onViewJobPosting && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onViewJobPosting(proposal);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Job Posting
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
