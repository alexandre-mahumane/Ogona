CREATE TYPE "public"."user_role" AS ENUM('guest', 'host');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'guest' NOT NULL;