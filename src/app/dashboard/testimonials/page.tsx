import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { TestimonialStats } from "@/components/testimonials/testimonial-stats";
import TestimonialsTable from "@/components/testimonials/testimonial-table";
import { auth } from "@/lib/auth";
import { getTestimonialsByUserId } from "@/lib/db/operations/testimonial";

type TestimonialsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function TestimonialsPage({
  searchParams,
}: TestimonialsPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth/signin");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  const result = await getTestimonialsByUserId(session.user.id, {
    page,
    pageSize,
  });

  return (
    <>
      <DashboardLayoutHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Testimonials" },
        ]}
      />
      <DashboardPageHeader
        title="Testimonials"
        description="Manage client testimonials to build credibility in your proposals"
      />
      <DashboardGutter as="main">
        <TestimonialStats total={result.pagination.total} />
        <TestimonialsTable
          testimonials={result.data}
          pagination={result.pagination}
        />
      </DashboardGutter>
    </>
  );
}
