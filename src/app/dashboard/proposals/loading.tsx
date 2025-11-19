import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { ProposalTrackingStatsSkeleton } from "@/components/proposals/proposal-tracking-stats";
import ProposalsTrackingTable from "@/components/proposals/proposal-tracking-table";

const Loader = () => (
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

    <DashboardGutter>
      <ProposalTrackingStatsSkeleton />
      <ProposalsTrackingTable isLoading proposals={[]} />
    </DashboardGutter>
  </>
);

export default Loader;
