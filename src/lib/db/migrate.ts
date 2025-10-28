// src/migrate.ts

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

config({ path: ".env" });

const isLocal = process.env.IS_LOCAL === "true";

const main = async () => {
  try {
    if (isLocal) {
      // Use local PostgreSQL for development
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL as string,
      });
      const db = drizzlePg(pool);

      await migratePg(db, { migrationsFolder: "./src/lib/db/migrations" });
      console.log("Migration completed (local PostgreSQL)");

      await pool.end();
    } else {
      // Use Neon serverless for staging/production
      const sql = neon(process.env.DATABASE_URL as string);
      const db = drizzleNeon(sql);

      await migrateNeon(db, { migrationsFolder: "./src/lib/db/migrations" });
      console.log("Migration completed (Neon serverless)");
    }
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
};

main();
