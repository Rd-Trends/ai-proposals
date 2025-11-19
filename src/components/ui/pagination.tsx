"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  showRowsPerPage?: boolean;
  pageSizeOptions?: number[];

  className?: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  showRowsPerPage = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`${pathname as Route}?${params.toString()}`);
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }
    updateSearchParams("page", String(newPage));
  };

  const changePageSize = (newPageSize: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newPageSize);
    params.set("page", "1"); // Reset to first page when changing page size
    router.push(`${pathname as Route}?${params.toString()}`);
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Results info */}
      <div className="flex-1 text-muted-foreground text-sm">
        <span className="hidden sm:inline">
          Showing {total === 0 ? 0 : startItem} to {endItem} of {total} results
        </span>
        <span className="sm:hidden">
          {total === 0 ? 0 : startItem}-{endItem} of {total}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-6">
        {/* Rows per page - hidden on mobile */}
        {showRowsPerPage && (
          <div className="hidden items-center gap-2 sm:flex">
            <p className="font-medium text-sm">Rows per page</p>
            <Select onValueChange={changePageSize} value={String(pageSize)}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page info on mobile */}
        <div className="flex items-center font-medium text-sm sm:hidden">
          Page {page} of {totalPages}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First page button - hidden on mobile */}
          <Button
            className="hidden h-8 w-8 p-0 sm:flex"
            disabled={page <= 1}
            onClick={() => goToPage(1)}
            size="sm"
            variant="outline"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous button */}
          <Button
            className="h-8 w-8 p-0 sm:w-8"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            size="sm"
            variant="outline"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page info - hidden on mobile */}
          <div className="hidden items-center px-2 sm:flex">
            <span className="font-medium text-sm">
              Page {page} of {totalPages}
            </span>
          </div>

          {/* Next button */}
          <Button
            className="h-8 w-8 p-0 sm:w-8"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            size="sm"
            variant="outline"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page button - hidden on mobile */}
          <Button
            className="hidden h-8 w-8 p-0 sm:flex"
            disabled={page >= totalPages}
            onClick={() => goToPage(totalPages)}
            size="sm"
            variant="outline"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
