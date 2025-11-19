import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MagicLinkAuth } from "@/components/auth/magic-link-auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Authentication - QuickRite",
  description:
    "Sign in to your QuickRite account or create a new account to start writing winning proposals.",
};

export default function AuthPage() {
  if (process.env.NODE_ENV !== "development") {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <h1 className="font-bold text-3xl">QuickRite</h1>
              <p className="text-gray-600">
                Choose how you&apos;d like to access your account
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild className="w-full" size="lg" variant="outline">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with magic link
                </span>
              </div>
            </div>

            <MagicLinkAuth />
          </div>
        </div>
      </div>
    </div>
  );
}
