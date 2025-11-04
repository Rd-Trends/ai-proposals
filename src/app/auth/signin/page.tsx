import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";
import { Logo } from "@/components/logo";

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
