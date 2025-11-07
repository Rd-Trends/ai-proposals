import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Sign In - QuickRite",
  description:
    "Sign in to your QuickRite account to access your proposal templates, track your success, and manage your freelance workflow.",
};

export default function SignInPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
        </Link>
        <SignInForm />
      </div>
    </div>
  );
}
