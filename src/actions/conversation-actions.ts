"use server";

import { openai } from "@ai-sdk/openai";
import { generateText, type UIMessage } from "ai";

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
