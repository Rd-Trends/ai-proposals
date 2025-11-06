import Link from "next/link";
import { RequestAccessForm } from "@/components/auth/request-access-form";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function RequestAccessPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
        </Link>
        <RequestAccessForm />
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          Already have access?{" "}
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
