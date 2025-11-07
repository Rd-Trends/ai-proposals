import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { WaitlistStats } from "@/components/waitlist/waitlist-stats";
import { WaitlistTable } from "@/components/waitlist/waitlist-table";
import { auth } from "@/lib/auth";
import { getAllWaitlistEntries } from "@/lib/db/operations/waitlist";

export const metadata: Metadata = {
  title: "Waitlist - QuickRite",
  description:
    "Manage waitlist entries and user access requests. View and process pending registrations.",
};

type WaitlistPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function WaitlistPage({
  searchParams,
}: WaitlistPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth/signin");
  }

  const adminEmails =
    process.env.ADMIN_EMAIL?.split(",").map((email) => email.trim()) || [];
  const isAdmin = adminEmails.some((email) => email === session.user.email);

  if (!isAdmin) {
    return redirect("/dashboard");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  // Get all waitlist entries
  const allEntries = await getAllWaitlistEntries();

  // Calculate pagination
  const total = allEntries.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  const paginatedEntries = allEntries.slice(offset, offset + pageSize);

  const pagination = {
    page,
    pageSize,
    total,
    totalPages,
  };

  return (
    <>
      <DashboardLayoutHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Waitlist" },
        ]}
      />
      <DashboardPageHeader
        title="Waitlist Management"
        description="Manage and monitor waitlist entries for platform access"
      />
      <DashboardGutter as="main">
        <WaitlistStats entries={allEntries} />
        <WaitlistTable entries={paginatedEntries} pagination={pagination} />
      </DashboardGutter>
    </>
  );
}
