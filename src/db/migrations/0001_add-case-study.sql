CREATE TYPE "public"."project_status" AS ENUM('planning', 'in_progress', 'completed', 'on_hold', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('case_study', 'client_work', 'personal_project');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" varchar(500),
	"description" text NOT NULL,
	"type" "project_type" DEFAULT 'case_study' NOT NULL,
	"category" varchar(100),
	"urls" jsonb DEFAULT '[]'::jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;