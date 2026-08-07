CREATE TABLE "favorites" (
	"guest_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_guest_id_property_id_pk" PRIMARY KEY("guest_id","property_id")
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "bathrooms" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "parking_spots" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "house_rules" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_guest_id_users_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;