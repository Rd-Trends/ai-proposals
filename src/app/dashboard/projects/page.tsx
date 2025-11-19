import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import ProjectsPageTable from "@/components/projects/project-table";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";
import { getProjectsByUserId } from "@/lib/db/operations/project";

export const metadata: Metadata = {
  title: "Projects and Case Studies - QuickRite",
  description: "Manage your projects and case studies for proposal references",
};

type ProjectsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
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
        description="Manage your projects and case studies for proposal references"
        title="Projects"
      />
      <DashboardGutter as="main">
        {/* <Suspense fallback={<ProjectStatsLoader />}>
          <ProjectStats user={session.user} />
        </Suspense> */}
        <Suspense fallback={<ProjectsPageTable isLoading projects={[]} />}>
          <ProjectsPageContent
            searchParams={searchParams}
            user={session.user}
          />
        </Suspense>
      </DashboardGutter>
    </>
  );
}

const ProjectsPageContent = async ({
  user,
  searchParams,
}: {
  user: User;
  searchParams: ProjectsPageProps["searchParams"];
}) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  const result = await getProjectsByUserId(user.id, {
    page,
    pageSize,
  });

  return (
    <ProjectsPageTable pagination={result.pagination} projects={result.data} />
  );
};
