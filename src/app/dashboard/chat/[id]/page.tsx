import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getConversationById,
  getMessagesByConversationId,
} from "@/lib/db/operations/conversation";
import { convertToUIMessages } from "@/lib/utils";
import ChatPage from "../chat";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/auth/signin");
  }

  const { id } = await props.params;

  const conversation = await getConversationById({
    id,
  });

  if (!conversation) {
    return redirect("/dashboard/chat");
  }

  if (conversation.userId !== session.user.id) {
    return notFound();
  }
  const messagesFromDb = await getMessagesByConversationId(id);

  const uiMessages = convertToUIMessages(messagesFromDb);

  return <ChatPage id={id} initialMessages={uiMessages} />;
}
