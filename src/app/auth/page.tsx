import Link from "next/link";
import { MagicLinkAuth } from "@/components/auth/magic-link-auth";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold">AI Proposals</h1>
              <p className="text-gray-600">
                Choose how you&apos;d like to access your account
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full" size="lg">
                  Create Account
                </Button>
              </Link>
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
