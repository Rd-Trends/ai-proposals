import {
  DashboardGutter,
  DashboardLayoutHeader,
} from "@/components/dashboard/layout";
import { TemplateStatsLoader } from "@/components/templates/template-stats";
import TemplatesPageTable from "@/components/templates/template-table";

const Loading = () => {
  return (
    <>
      <DashboardLayoutHeader
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
