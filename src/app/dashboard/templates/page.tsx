import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import {
  TemplateStats,
  TemplateStatsLoader,
} from "@/components/templates/template-stats";
import TemplatesPageTable from "@/components/templates/template-table";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";
import { getTemplatesByUserId } from "@/lib/db/operations/template";

type TemplatesPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: "draft" | "active" | "archived";
  }>;
};

export default async function TemplatesPage({
  searchParams,
}: TemplatesPageProps) {
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
          { label: "Templates" },
        ]}
      />
      <DashboardPageHeader
        title="Templates"
        description="Manage your proposal templates and track their performance"
      />
      <DashboardGutter as="main">
        <Suspense fallback={<TemplateStatsLoader />}>
          <TemplateStats user={session.user} />
        </Suspense>
        <Suspense fallback={<TemplatesPageTable templates={[]} isLoading />}>
          <TemplatesPageContent
            user={session.user}
            searchParams={searchParams}
          />
        </Suspense>
      </DashboardGutter>
    </>
  );
}

const TemplatesPageContent = async ({
  user,
  searchParams,
}: {
  user: User;
  searchParams: TemplatesPageProps["searchParams"];
}) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const status = params.status;

  const result = await getTemplatesByUserId(user.id, {
    page,
    pageSize,
    status,
  });

  return (
    <TemplatesPageTable
      templates={result.data}
      pagination={result.pagination}
    />
  );
};
