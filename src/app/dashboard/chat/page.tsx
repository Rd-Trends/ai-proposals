import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { generateUUID } from "@/lib/utils";
import ChatPage from "./chat";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth/signin");
  }

  const id = generateUUID();

  return <ChatPage id={id} initialMessages={[]} />;
}
