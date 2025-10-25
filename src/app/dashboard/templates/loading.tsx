import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { TemplateStatsLoader } from "@/components/templates/template-stats";
import TemplatesPageTable from "@/components/templates/template-table";

const Loading = () => {
  return (
    <>
      <DashboardLayoutHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Templates" },
        ]}
      />
      <DashboardPageHeader
        title="Templates"
        description="Manage your proposal templates and track their performance"
      />
      <DashboardGutter as="main">
        <TemplateStatsLoader />
        <TemplatesPageTable templates={[]} isLoading />
      </DashboardGutter>
    </>
  );
};

export default Loading;
