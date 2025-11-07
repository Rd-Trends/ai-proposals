import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Chat } from "@/components/chats";
import { auth } from "@/lib/auth";
import { generateUUID } from "@/lib/utils";

export const metadata: Metadata = {
  title: "New Chat - QuickRite",
  description:
    "Start a new AI-powered conversation to generate proposals, create templates, or get assistance with your freelance workflow.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth/signin");
  }

  const id = generateUUID();

  return <Chat id={id} initialMessages={[]} isReadonly={false} />;
}
