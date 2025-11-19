import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  DashboardGutter,
  DashboardLayoutHeader,
  DashboardPageHeader,
} from "@/components/dashboard/layout";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile Settings - QuickRite",
  description:
    "Manage your QuickRite profile, update your information, and customize your account settings.",
};

export default async function ProfilePage() {
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
          { label: "Profile" },
        ]}
      />
      <DashboardPageHeader
        description="Update your personal information and preferences."
        title="Profile Settings"
      />
      <DashboardGutter>
        <Card className="mx-auto w-[calc(100vw-2rem)] sm:max-w-xl">
          <CardContent>
            <ProfileForm user={session.user} />
          </CardContent>
        </Card>
      </DashboardGutter>
    </>
  );
}
