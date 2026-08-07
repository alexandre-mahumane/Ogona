CREATE TYPE "public"."amenity" AS ENUM('wifi_gratuito', 'ar_condicionado', 'televisao', 'casa_banho_privativa', 'agua_quente', 'roupa_de_cama', 'toalhas', 'mesa_de_trabalho', 'minibar', 'cofre', 'varanda', 'vista_mar', 'estacionamento', 'pequeno_almoco', 'kitchenette', 'frigorifico', 'roupeiro', 'secador_cabelo', 'ferro_engomar', 'rede_mosquito');--> statement-breakpoint
CREATE TYPE "public"."booking_modality" AS ENUM('hora', 'noite', 'semana', 'mes');--> statement-breakpoint
CREATE TYPE "public"."community" AS ENUM('polana', 'sommerschield', 'costa_do_sol', 'bairro_central', 'malhangalene', 'maxaquene', 'alto_mae', 'coop', 'triunfo', 'matola_cidade', 'matola_rio', 'ka_tembe', 'catembe', 'marracuene', 'xai_xai', 'bilene', 'inhambane_cidade', 'tofo', 'barra', 'vilanculos', 'bazaruto', 'beira', 'chimoio', 'tete_cidade', 'quelimane', 'nampula_cidade', 'ilha_de_mocambique', 'pemba', 'nacala', 'lichinga', 'outra');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('pensao', 'apartamento', 'hotel', 'casa', 'hostel', 'villa', 'lodge', 'resort');--> statement-breakpoint
CREATE TYPE "public"."province" AS ENUM('maputo_cidade', 'maputo_provincia', 'gaza', 'inhambane', 'sofala', 'manica', 'tete', 'zambezia', 'nampula', 'cabo_delgado', 'niassa');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('disponivel', 'indisponivel', 'manutencao');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('individual', 'casal', 'twin', 'triple', 'suite', 'familiar', 'estudio', 'dormitorio');--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"type" "property_type" NOT NULL,
	"description" varchar(500) NOT NULL,
	"contact_phone" varchar(32) NOT NULL,
	"whatsapp" varchar(32),
	"province" "province" NOT NULL,
	"city" varchar(120) NOT NULL,
	"community" "community",
	"neighborhood" varchar(120) NOT NULL,
	"address" varchar(255) NOT NULL,
	"postal_code" varchar(20),
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"status" "property_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"amenity" "amenity" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"url" varchar(2048) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"modality" "booking_modality" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'MZN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"type" "room_type" NOT NULL,
	"status" "room_status" DEFAULT 'disponivel' NOT NULL,
	"description" varchar(500) NOT NULL,
	"max_capacity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_amenities" ADD CONSTRAINT "room_amenities_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_images" ADD CONSTRAINT "room_images_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_prices" ADD CONSTRAINT "room_prices_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "room_amenities_room_amenity_uidx" ON "room_amenities" USING btree ("room_id","amenity");--> statement-breakpoint
CREATE UNIQUE INDEX "room_images_room_url_uidx" ON "room_images" USING btree ("room_id","url");--> statement-breakpoint
CREATE UNIQUE INDEX "room_prices_room_modality_uidx" ON "room_prices" USING btree ("room_id","modality");