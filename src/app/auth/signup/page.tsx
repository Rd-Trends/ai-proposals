import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <SignUpForm />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Button variant="link" asChild>
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
