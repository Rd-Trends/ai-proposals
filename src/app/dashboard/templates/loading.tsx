import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { TemplateStatsLoader } from "@/components/templates/template-stats";
import TemplatesPageTable from "@/components/templates/template-table";

const Loading = () => (
  <>
    <DashboardLayoutHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Templates" },
      ]}
    />
    <DashboardPageHeader
      description="Manage your proposal templates and track their performance"
      title="Templates"
    />
    <DashboardGutter as="main">
      <TemplateStatsLoader />
      <TemplatesPageTable isLoading templates={[]} />
    </DashboardGutter>
  </>
);

export default Loading;
