CREATE TABLE "resarch_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"title" text,
	"summary" text,
	"key_concepts" jsonb,
	"useful_for" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
