import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Chat } from "@/components/chats";
import { auth } from "@/lib/auth";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth/signin");
  }

  const id = generateUUID();

  return <Chat id={id} initialMessages={[]} />;
}
