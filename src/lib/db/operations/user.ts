import { eq } from "drizzle-orm";
import { type NewUser, type User, users } from "@/lib/db/schema/auth";
import { db } from "../drizzle";

// Create a new user
export async function createUser(userData: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

// Update user
export async function updateUser(
  id: string,
  userData: Partial<NewUser>
): Promise<User> {
  const [user] = await db
    .update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}
