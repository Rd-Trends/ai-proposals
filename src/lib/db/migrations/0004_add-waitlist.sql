CREATE TABLE "waitlist" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"invited_by" text,
	"invited_at" timestamp NOT NULL,
	"used_at" timestamp,
	"notes" text,
	"is_active" boolean NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
