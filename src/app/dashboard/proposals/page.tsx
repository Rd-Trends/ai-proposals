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

export default async function ProposalsPage() {
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
        title="Proposals"
        description="Track your proposal submissions and analyze their performance"
      />

      <DashboardGutter as="main">
        <Suspense fallback={<ProposalTrackingStatsSkeleton />}>
          <ProposalTrackingStats user={session.user} />
        </Suspense>
        <Suspense
          fallback={<ProposalsTrackingTable proposals={[]} isLoading />}
        >
          <ProposalsTrackingPageContent user={session.user} />
        </Suspense>
      </DashboardGutter>
    </>
  );
}

const ProposalsTrackingPageContent = async ({ user }: { user: User }) => {
  const proposals = await getProposalTrackingByUserId(user.id);

  return <ProposalsTrackingTable proposals={proposals} />;
};
