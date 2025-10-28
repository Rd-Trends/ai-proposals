"use server";

import { openai } from "@ai-sdk/openai";
import { generateText, type UIMessage } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  createConversation,
  deleteConversation,
  getConversationById,
  getConversationsByUserId,
  updateConversationTitle,
} from "@/lib/db/operations/conversation";

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - if the message is too vague or doesn't contain enough information to create a meaningful title, respond with exactly "New Chat"
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  // Fallback if AI returns empty or very short title
  if (!title || title.trim().length < 3) {
    return "New Chat";
  }

  return title.trim();
}

export const createConversationAction = async (title: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const conversation = await createConversation({
    userId: session.user.id,
    title,
  });

  return conversation;
};

export const getConversationsAction = async (params?: {
  page?: number;
  pageSize?: number;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const paginationParams =
    params?.page && params?.pageSize
      ? { page: params.page, pageSize: params.pageSize }
      : undefined;

  const result = await getConversationsByUserId(
    session.user.id,
    paginationParams,
  );
  return result;
};

export const getConversationAction = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const conversation = await getConversationById({ id });

  if (!conversation || conversation.userId !== session.user.id) {
    throw new Error("Conversation not found");
  }

  return conversation;
};

export const updateConversationTitleAction = async (
  id: string,
  title: string,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const existingConversation = await getConversationById({ id });

  if (
    !existingConversation ||
    existingConversation.userId !== session.user.id
  ) {
    throw new Error("Conversation not found");
  }

  const conversation = await updateConversationTitle(id, title);
  return conversation;
};

export const deleteConversationAction = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const existingConversation = await getConversationById({ id });

  if (
    !existingConversation ||
    existingConversation.userId !== session.user.id
  ) {
    throw new Error("Conversation not found");
  }

  await deleteConversation(id);
};
