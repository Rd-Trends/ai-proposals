-- Add name column as nullable first
ALTER TABLE "waitlist" ADD COLUMN "name" text;

-- Populate name column for existing waitlist entries from users table
UPDATE "waitlist" w SET "name" = u."name" FROM "users" u WHERE LOWER(w."email") = LOWER(u."email");

-- Set default name for any remaining entries without a match
UPDATE "waitlist" SET "name" = 'Unknown User' WHERE "name" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "waitlist" ALTER COLUMN "name" SET NOT NULL;
