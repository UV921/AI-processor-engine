;
import { doublePrecision, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type ClaimVerdict = {
    claim: string;
    supported: boolean;
    evidence: string | null;
    reason: string;
};

// Fine grained position in the pipeline. `status` stays coarse for the
// research job; `stage` also covers the evaluation worker, which runs after
// status is already "completed".
export const RESARCH_STAGES = [
    "queued",
    "fetching",
    "analyzing",
    "analyzed",
    "eval-queued",
    "extracting-claims",
    "verifying-claims",
    "scored",
    "failed",
] as const;

export type ResarchStage = (typeof RESARCH_STAGES)[number];

export const resarchTable=pgTable("resarch_table",{
    id:uuid("id").primaryKey().defaultRandom(),
    url:text("url").notNull(),
    status:text("status").notNull().default("pending"),
    stage:text("stage").$type<ResarchStage>().notNull().default("queued"),
    sourceText:text("source_text"),
    
    title:text("title"),
    summary:text("summary"),    
    keyConcepts: jsonb("key_concepts").$type<string[]>(),

    usefulFor: jsonb("useful_for").$type<string[]>(),

    claims: jsonb("claims").$type<ClaimVerdict[]>(),
    groundedness: doublePrecision("groundedness"),
  
    errorMessage: text("error_message"),
    createdAt:timestamp("created_at").defaultNow(),
    updatedAt:timestamp("updated_at").$defaultFn(()=>new Date()),



})
