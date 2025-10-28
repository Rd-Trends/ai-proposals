import { tool } from "ai";
import type { User } from "better-auth";
import z from "zod";
import { getTestimonialsByUserId } from "@/lib/db/operations/testimonial";

export const getTestimonials = (user: User) =>
  tool({
    description:
      "Retrieve the user's client testimonials for use in proposals.",
    inputSchema: z.object({}),
    execute: async () => getTestimonialsByUserId(user.id),
  });
