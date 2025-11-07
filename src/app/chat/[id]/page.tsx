import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Chat } from "@/components/chats";
import { auth } from "@/lib/auth";
import {
  getConversationById,
  getMessagesByConversationId,
} from "@/lib/db/operations/conversation";
import { convertToUIMessages } from "@/lib/utils";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const conversation = await getConversationById({ id });

  return {
    title: conversation?.title
      ? `${conversation.title} - QuickRite`
      : "Shared Chat - QuickRite",
    description: conversation?.isPublic
      ? "View this shared conversation about proposals and freelance projects."
      : "Access a QuickRite conversation.",
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { id } = await props.params;

  const conversation = await getConversationById({
    id,
  });

  if (!conversation) {
    return notFound();
  }

  if (!conversation.isPublic) {
    if (!session?.user || session.user.id !== conversation.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByConversationId(id);

  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <Chat
      id={id}
      initialMessages={uiMessages}
      conversation={conversation}
      isReadonly={conversation.userId !== session?.user?.id}
    />
  );
}
