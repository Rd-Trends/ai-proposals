import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <SignInForm />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Button variant="link" asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
