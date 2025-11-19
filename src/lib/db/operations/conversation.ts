import { and, asc, count, desc, eq, gte } from "drizzle-orm";
import {
  type Conversation,
  conversations as conversations_table,
  messages as messages_table,
  type NewConversation,
  type NewMessage,
} from "@/lib/db/schema/conversations";
import { ChatSDKError } from "@/lib/error";
import type { PaginatedResult, PaginationParams } from "@/lib/types";
import { db } from "../drizzle";
import { calculateTotalPages, getPaginationOffset } from "./util";

export const createConversation = async (data: NewConversation) => {
  const [conversation] = await db
    .insert(conversations_table)
    .values({
      ...data,
    })
    .returning();
  return conversation;
};

export const getConversationById = async ({ id }: { id: string }) => {
  try {
    const conversation = await db
      .select()
      .from(conversations_table)
      .where(eq(conversations_table.id, id))
      .then((res) => res[0]);
    return conversation;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get conversation by id"
    );
  }
};

export const getConversationsByUserId = async (
  userId: string,
  params?: PaginationParams
): Promise<PaginatedResult<Conversation>> => {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const offset = getPaginationOffset(page, pageSize);

  const sq = db
    .select({ id: conversations_table.id })
    .from(conversations_table)
    .where(eq(conversations_table.userId, userId))
    .orderBy(desc(conversations_table.updatedAt))
    .limit(pageSize)
    .offset(offset)
    .as("subquery");

  const userConversations = await db
    .select()
    .from(conversations_table)
    .innerJoin(sq, eq(conversations_table.id, sq.id))
    .orderBy(desc(conversations_table.updatedAt));

  const [totalResult] = await db
    .select({ total: count() })
    .from(conversations_table)
    .where(eq(conversations_table.userId, userId));

  const total = totalResult?.total ?? 0;
  const totalPages = calculateTotalPages(total, pageSize);

  return {
    data: userConversations.map((row) => row.conversations),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
};

export const updateConversation = async (
  id: string,
  data: { title?: string; isPublic?: boolean }
) => {
  const [conversation] = await db
    .update(conversations_table)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(conversations_table.id, id))
    .returning();
  return conversation;
};

export const updateConversationTimestamp = async (id: string) => {
  await db
    .update(conversations_table)
    .set({ updatedAt: new Date() })
    .where(eq(conversations_table.id, id));
};

export const deleteConversation = async (id: string) => {
  await db.delete(conversations_table).where(eq(conversations_table.id, id));
};

export const saveMessages = async (messages: NewMessage[]) => {
  if (messages.length === 0) {
    return [];
  }

  const insertedMessages = await db
    .insert(messages_table)
    .values(messages)
    .returning();

  // Update conversation timestamp
  if (messages.length > 0) {
    await updateConversationTimestamp(messages[0].conversationId);
  }

  return insertedMessages;
};

export const getMessagesByConversationId = async (conversationId: string) => {
  const conversationMessages = await db
    .select()
    .from(messages_table)
    .where(eq(messages_table.conversationId, conversationId))
    .orderBy(asc(messages_table.createdAt));
  return conversationMessages;
};

export const getMessageById = async ({ id }: { id: string }) => {
  try {
    const message = await db.query.messages.findFirst({
      where: eq(messages_table.id, id),
      with: { conversation: true },
    });
    return message;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
};

export const deleteMessagesByConversationIdAfterTimestamp = async ({
  conversationId,
  timestamp,
}: {
  conversationId: string;
  timestamp: Date;
}) => {
  await db
    .delete(messages_table)
    .where(
      and(
        eq(messages_table.conversationId, conversationId),
        gte(messages_table.createdAt, timestamp)
      )
    );
};
