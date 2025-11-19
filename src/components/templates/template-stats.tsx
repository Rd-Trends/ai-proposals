import { FileText, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/lib/auth-client";
import { getUserTemplateStats } from "@/lib/db/operations/analytics";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

const TemplateStats = async ({ user }: { user: User }) => {
  const stats = await getUserTemplateStats(user.id);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Templates</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.totalTemplates}</div>
          <p className="text-muted-foreground text-xs">
            {stats.activeTemplates} active templates
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Usage</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.totalUsage}</div>
          <p className="text-muted-foreground text-xs">Across all templates</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Recent Usage</CardTitle>
          <Badge variant={stats.recentUsage > 10 ? "default" : "secondary"}>
            Last 30 days
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.recentUsage}</div>
          <p className="text-muted-foreground text-xs">
            Proposals generated recently
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Favorites</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.favoriteTemplates}</div>
          <p className="text-muted-foreground text-xs">Starred templates</p>
        </CardContent>
      </Card>
    </div>
  );
};

const TemplateStatsSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: index will not change
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-1 h-7 w-8" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export { TemplateStats, TemplateStatsSkeleton as TemplateStatsLoader };
