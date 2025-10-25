import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { ProposalTrackingStatsSkeleton } from "@/components/proposals/proposal-tracking-stats";
import ProposalsTrackingTable from "@/components/proposals/proposal-tracking-table";

const Loader = () => {
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

      <DashboardGutter>
        <ProposalTrackingStatsSkeleton />
        <ProposalsTrackingTable proposals={[]} isLoading />
      </DashboardGutter>
    </>
  );
};

export default Loader;
