import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
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
      : "Chat - QuickRite",
    description:
      "Continue your AI-powered conversation to work on proposals, templates, and freelance projects.",
  };
}

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
    <Chat
      conversation={conversation}
      id={id}
      initialMessages={uiMessages}
      isReadonly={false}
    />
  );
}
