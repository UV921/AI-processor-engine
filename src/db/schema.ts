;
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";



export const resarchTable=pgTable("resarch_table",{
    id:uuid("id").primaryKey().defaultRandom(),
    url:text("url").notNull(),
    status:text("status").notNull().default("pending"),
    sourceText:text("source_text"),
    
    title:text("title"),
    summary:text("summary"),    
    keyConcepts: jsonb("key_concepts").$type<string[]>(),

    usefulFor: jsonb("useful_for").$type<string[]>(),
  
    errorMessage: text("error_message"),
    createdAt:timestamp("created_at").defaultNow(),
    updatedAt:timestamp("updated_at").$defaultFn(()=>new Date()),



})