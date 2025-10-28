import { tool } from "ai";
import type { User } from "better-auth";
import z from "zod";
import { getProjectsByUserId } from "@/lib/db/operations/project";

export const getProjectsAndCaseStudies = (user: User) =>
  tool({
    description: "Retrieve the user's projects and case studies.",
    inputSchema: z.object({}),
    execute: async () => getProjectsByUserId(user.id),
  });
