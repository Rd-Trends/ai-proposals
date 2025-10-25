import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import ProjectsPageTable from "@/components/projects/project-table";
import { getProjectsByUserId } from "@/db/operations/project";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";

export default async function ProjectsPage() {
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
          { label: "Projects" },
        ]}
      />
      <DashboardPageHeader
        title="Projects"
        description="Manage your projects and case studies for proposal references"
      />
      <DashboardGutter as="main">
        {/* <Suspense fallback={<ProjectStatsLoader />}>
          <ProjectStats user={session.user} />
        </Suspense> */}
        <Suspense fallback={<ProjectsPageTable projects={[]} isLoading />}>
          <ProjectsPageContent user={session.user} />
        </Suspense>
      </DashboardGutter>
    </>
  );
}

const ProjectsPageContent = async ({ user }: { user: User }) => {
  const projects = await getProjectsByUserId(user.id);

  return <ProjectsPageTable projects={projects} />;
};
