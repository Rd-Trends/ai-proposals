import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["total", "case-studies", "client-work", "categories"].map(
          (cardType) => (
            <div className="rounded-lg border p-6" key={cardType}>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="mt-2 h-8 w-12" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          )
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="mt-1 h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
              </div>

              {/* Table rows */}
              {["row-1", "row-2", "row-3", "row-4", "row-5"].map((rowId) => (
                <div className="flex items-center space-x-4 py-3" key={rowId}>
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
