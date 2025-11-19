import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import {
  ProposalTrackingStats,
  ProposalTrackingStatsSkeleton,
} from "@/components/proposals/proposal-tracking-stats";
import ProposalsTrackingTable from "@/components/proposals/proposal-tracking-table";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";
import { getProposalTrackingByUserId } from "@/lib/db/operations/proposal";

export const metadata: Metadata = {
  title: "Proposals - QuickRite",
  description:
    "Track your proposal submissions, response rates, and success metrics across all freelance platforms.",
};

type ProposalsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function ProposalsPage({
  searchParams,
}: ProposalsPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth/signin");
  }

  return (
    <>
      <DashboardLayoutHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Proposals" },
        ]}
      />
      <DashboardPageHeader
        description="Track your proposal submissions and analyze their performance"
        title="Proposals"
      />

      <DashboardGutter as="main">
        <Suspense fallback={<ProposalTrackingStatsSkeleton />}>
          <ProposalTrackingStats user={session.user} />
        </Suspense>
        <Suspense
          fallback={<ProposalsTrackingTable isLoading proposals={[]} />}
        >
          <ProposalsTrackingPageContent
            searchParams={searchParams}
            user={session.user}
          />
        </Suspense>
      </DashboardGutter>
    </>
  );
}

const ProposalsTrackingPageContent = async ({
  user,
  searchParams,
}: {
  user: User;
  searchParams: ProposalsPageProps["searchParams"];
}) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  const result = await getProposalTrackingByUserId(user.id, {
    page,
    pageSize,
  });

  return (
    <ProposalsTrackingTable
      pagination={result.pagination}
      proposals={result.data}
    />
  );
};
