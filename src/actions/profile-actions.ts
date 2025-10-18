"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  image: z.string().optional(),
  bio: z.string(),
});

export async function updateProfile(values: z.infer<typeof profileSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const validatedFields = profileSchema.parse(values);

    await db
      .update(users)
      .set({
        ...validatedFields,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return { success: true, error: null };
  } catch (err) {
    console.error("Error updating profile:", err);
    return { data: null, error: "Failed to toggle favorite", success: false };
  }
}
