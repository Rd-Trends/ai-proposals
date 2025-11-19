import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Sign Up - QuickRite",
  description:
    "Create your QuickRite account and start generating AI-powered proposals to win more freelance jobs on Upwork, Contra, and Fiverr.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          <Logo />
        </Link>
        <SignUpForm />
      </div>
    </div>
  );
}
