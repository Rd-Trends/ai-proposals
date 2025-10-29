import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { TestimonialStatsLoader } from "@/components/testimonials/testimonial-stats";
import TestimonialsTable from "@/components/testimonials/testimonial-table";

export default function TestimonialsLoading() {
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
        <TestimonialStatsLoader />
        <TestimonialsTable testimonials={[]} isLoading />
      </DashboardGutter>
    </>
  );
}
