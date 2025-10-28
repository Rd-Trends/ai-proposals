import { tool } from "ai";
import type { User } from "better-auth";
import z from "zod";
import { getTemplatesByUserId } from "@/lib/db/operations/template";

export const getTemplates = (user: User) =>
  tool({
    description: "Retrieve the user's proposal templates.",
    inputSchema: z.object({}),
    execute: async () => getTemplatesByUserId(user.id),
  });
