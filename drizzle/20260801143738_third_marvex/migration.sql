ALTER TABLE "resarch_table" ADD COLUMN "stage" text DEFAULT 'queued' NOT NULL;--> statement-breakpoint
ALTER TABLE "resarch_table" ADD COLUMN "claims" jsonb;--> statement-breakpoint
ALTER TABLE "resarch_table" ADD COLUMN "groundedness" double precision;