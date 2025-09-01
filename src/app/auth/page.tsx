import { MagicLinkAuth } from "@/components/auth/magic-link-auth";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <MagicLinkAuth />
        </div>
      </div>
    </div>
  );
}
