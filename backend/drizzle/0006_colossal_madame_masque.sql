CREATE TYPE "public"."payment_method" AS ENUM('m_pesa', 'e_mola');--> statement-breakpoint
ALTER TYPE "public"."reservation_status" ADD VALUE IF NOT EXISTS 'awaiting_payment' BEFORE 'confirmed';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "photo_url" varchar(2048);--> statement-breakpoint
ALTER TABLE "room_prices" ADD COLUMN IF NOT EXISTS "min_units" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "room_prices" ADD COLUMN IF NOT EXISTS "max_units" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "bed_label" varchar(80);--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "start_time" varchar(5);--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "units" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "unit_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "subtotal_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "fee_percent" numeric(5, 2) DEFAULT '3.30' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "fee_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "payment_method" "payment_method";--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "payment_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "method" "payment_method";--> statement-breakpoint
UPDATE "reservations"
SET
  "unit_price" = COALESCE("unit_price", "total_amount"),
  "subtotal_amount" = COALESCE("subtotal_amount", "total_amount"),
  "fee_amount" = COALESCE("fee_amount", 0)
WHERE "unit_price" IS NULL OR "subtotal_amount" IS NULL OR "fee_amount" IS NULL;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "unit_price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "subtotal_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "fee_amount" SET NOT NULL;
