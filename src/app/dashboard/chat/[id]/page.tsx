import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Chat } from "@/components/chats";
import { auth } from "@/lib/auth";
import {
  getConversationById,
  getMessagesByConversationId,
} from "@/lib/db/operations/conversation";
import { convertToUIMessages } from "@/lib/utils";

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

  return (
    <Chat id={id} initialMessages={uiMessages} conversation={conversation} />
  );
}
