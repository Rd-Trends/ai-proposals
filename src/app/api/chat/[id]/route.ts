import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  deleteConversation,
  getConversationById,
  updateConversationTitle,
} from "@/lib/db/operations/conversation";

const updateConversationSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(80, "Title must be at most 80 characters"),
});

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/chat/[id]">,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const conversation = await getConversationById({ id });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (conversation.userId !== session.user.id) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You don't have permission to access this conversation",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/chat/[id]">,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    // Check if conversation exists and belongs to user
    const existingConversation = await getConversationById({ id });

    if (!existingConversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (existingConversation.userId !== session.user.id) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You don't have permission to update this conversation",
        },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const json = await request.json();
    const validationResult = updateConversationSchema.safeParse(json);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error:
            validationResult.error.errors[0]?.message || "Invalid request body",
        },
        { status: 400 },
      );
    }

    const { title } = validationResult.data;

    // Update conversation title
    const updatedConversation = await updateConversationTitle(id, title);

    return NextResponse.json({
      conversation: updatedConversation,
      message: "Conversation updated successfully",
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/chat/[id]">,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    // Check if conversation exists and belongs to user
    const existingConversation = await getConversationById({ id });

    if (!existingConversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (existingConversation.userId !== session.user.id) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You don't have permission to delete this conversation",
        },
        { status: 403 },
      );
    }

    // Delete conversation
    await deleteConversation(id);

    return NextResponse.json({
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 },
    );
  }
}
