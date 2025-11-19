import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./schema/auth";
import * as schema from "./schema/conversations";

config({ path: ".env" }); // or .env.local

export const db = drizzle(process.env.DATABASE_URL as string, {
  schema: { ...schema },
});
