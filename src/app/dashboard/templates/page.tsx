import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  DashboardGutter,
  DashboardLayoutHeader,
} from "@/components/dashboard/layout";
import {
  TemplateStats,
  TemplateStatsLoader,
} from "@/components/templates/template-stats";
import TemplatesPageTable from "@/components/templates/template-table";
import { templateOperations } from "@/db/operations";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";

export default async function TemplatesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth/signin");
  }

  return (
    <>
      <DashboardLayoutHeader
        title="Templates"
        description="Manage your proposal templates and track their performance"
      />
      <DashboardGutter as="main">
        <Suspense fallback={<TemplateStatsLoader />}>
          <TemplateStats user={session.user} />
        </Suspense>
        <Suspense fallback={<TemplatesPageTable templates={[]} isLoading />}>
          <TemplatesPageContent user={session.user} />
        </Suspense>
      </DashboardGutter>
    </>
  );
}

const TemplatesPageContent = async ({ user }: { user: User }) => {
  const templates = await templateOperations.getByUserId(user.id);

  return <TemplatesPageTable templates={templates} />;
};
