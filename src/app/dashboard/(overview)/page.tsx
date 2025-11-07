import { formatDistanceToNow } from "date-fns";
import {
  Award,
  Briefcase,
  FileText,
  MessageSquare,
  Quote,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard - QuickRite",
  description:
    "View your proposal performance metrics, recent activity, and manage your freelance workflow.",
};

import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import {
  getProposalStatusBadgeVariant,
  getProposalStatusLabel,
} from "@/components/proposals/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";
import {
  getUserProposalStats,
  getUserTemplateStats,
} from "@/lib/db/operations/analytics";
import { getProposalTrackingByUserId } from "@/lib/db/operations/proposal";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect("/auth");
  }

  const { user } = session;

  return (
    <>
      <DashboardLayoutHeader breadcrumbs={[{ label: "Dashboard" }]} />
      <DashboardPageHeader
        title="Dashboard"
        description={`Welcome back, ${user.name || user.email}!`}
        action={
          <Button asChild>
            <Link href="/dashboard/proposals">
              <FileText className="mr-2 h-4 w-4" />
              View Proposals
            </Link>
          </Button>
        }
      />

      <DashboardGutter as="main">
        <Suspense fallback={<StatsOverviewSkeleton />}>
          <StatsOverview user={user} />
        </Suspense>

        <div className="grid gap-4 lg:grid-cols-2">
          <Suspense fallback={<RecentProposalsSkeleton />}>
            <RecentProposals user={user} />
          </Suspense>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start"
                variant="outline"
                asChild
              >
                <Link href="/dashboard/chat">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open AI Chat
                </Link>
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                asChild
              >
                <Link href="/dashboard/proposals">
                  <FileText className="mr-2 h-4 w-4" />
                  View Proposals
                </Link>
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                asChild
              >
                <Link href="/dashboard/templates">
                  <FileText className="mr-2 h-4 w-4" />
                  Browse Templates
                </Link>
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                asChild
              >
                <Link href="/dashboard/projects">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Manage Projects
                </Link>
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                asChild
              >
                <Link href="/dashboard/testimonials">
                  <Quote className="mr-2 h-4 w-4" />
                  View Testimonials
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardGutter>
    </>
  );
}

// Stats Overview
const StatsOverview = async ({ user }: { user: User }) => {
  const [proposalStats, templateStats] = await Promise.all([
    getUserProposalStats(user.id),
    getUserTemplateStats(user.id),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {proposalStats.totalProposals}
          </div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{proposalStats.successRate}%</div>
          <p className="text-xs text-muted-foreground">
            {proposalStats.jobsAwarded} jobs awarded
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {proposalStats.responseRate}%
          </div>
          <p className="text-xs text-muted-foreground">
            {proposalStats.clientResponses} client responses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {templateStats.totalTemplates}
          </div>
          <p className="text-xs text-muted-foreground">
            {templateStats.activeTemplates} active
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const StatsOverviewSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: index will not change
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-12 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Recent Proposals
const RecentProposals = async ({ user }: { user: User }) => {
  const result = await getProposalTrackingByUserId(user.id);
  const recent = result.data.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Proposals</CardTitle>
        <CardDescription>
          Your latest proposal drafts and submissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No proposals yet. Create your first one.
          </p>
        ) : (
          recent.map((p) => (
            <div className="flex items-start justify-between" key={p.id}>
              <div>
                <p className="text-sm font-medium pb-1">{p.jobTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {p.sentAt
                    ? `Created ${formatDistanceToNow(new Date(p.sentAt), { addSuffix: true })}`
                    : "Created recently"}
                </p>
              </div>
              <Badge variant={getProposalStatusBadgeVariant(p.currentOutcome)}>
                {getProposalStatusLabel(p.currentOutcome)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const RecentProposalsSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: index will not change
        <div className="flex items-center justify-between" key={i}>
          <div>
            <Skeleton className="h-4 w-48 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </CardContent>
  </Card>
);
