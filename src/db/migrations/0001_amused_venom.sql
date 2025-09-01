ALTER TABLE "proposal_tracking" RENAME COLUMN "proposal_title" TO "job_title";--> statement-breakpoint
ALTER TABLE "proposal_tracking" ADD COLUMN "job_description" text NOT NULL;