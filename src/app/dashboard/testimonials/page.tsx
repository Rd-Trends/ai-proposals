import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Testimonials - QuickRite",
  description:
    "Manage client testimonials and reviews. Showcase your best work and success stories.",
};

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
        description="Manage client testimonials to build credibility in your proposals"
        title="Testimonials"
      />
      <DashboardGutter as="main">
        <TestimonialStats total={result.pagination.total} />
        <TestimonialsTable
          pagination={result.pagination}
          testimonials={result.data}
        />
      </DashboardGutter>
    </>
  );
}
