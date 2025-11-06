-- Add name column as nullable first (idempotent)
ALTER TABLE "public"."waitlist" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
-- Populate name column for existing waitlist entries from users table (only where null)
UPDATE "public"."waitlist" AS w
SET "name" = u."name"
FROM "public"."users" AS u
WHERE w."name" IS NULL AND LOWER(w."email") = LOWER(u."email");
--> statement-breakpoint
-- Set default name for any remaining entries without a match
UPDATE "public"."waitlist"
SET "name" = 'Unknown User'
WHERE "name" IS NULL;
--> statement-breakpoint
-- Now make the column NOT NULL
ALTER TABLE "public"."waitlist" ALTER COLUMN "name" SET NOT NULL;
