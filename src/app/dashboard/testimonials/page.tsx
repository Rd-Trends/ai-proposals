import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { TestimonialStats } from "@/components/testimonials/testimonial-stats";
import TestimonialsTable from "@/components/testimonials/testimonial-table";
import { getTestimonialsByUserId } from "@/db/operations/testimonial";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";

export default async function TestimonialsPage() {
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
          { label: "Testimonials" },
        ]}
      />
      <DashboardPageHeader
        title="Testimonials"
        description="Manage client testimonials to build credibility in your proposals"
      />
      <DashboardGutter as="main">
        <Suspense fallback={<TestimonialsTable testimonials={[]} isLoading />}>
          <TestimonialsPageContent user={session.user} />
        </Suspense>
      </DashboardGutter>
    </>
  );
}

const TestimonialsPageContent = async ({ user }: { user: User }) => {
  const testimonials = await getTestimonialsByUserId(user.id);

  return (
    <>
      <TestimonialStats testimonials={testimonials} />
      <TestimonialsTable testimonials={testimonials} />
    </>
  );
};
