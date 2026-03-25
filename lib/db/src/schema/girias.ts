import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const giriasTable = pgTable("girias", {
  id: serial("id").primaryKey(),
  term: text("term").notNull().unique(),
  definition: text("definition").notNull(),
  example: text("example").notNull(),
  culturalContext: text("cultural_context").notNull(),
  category: text("category").notNull().default("gíria"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGiriaSchema = createInsertSchema(giriasTable).omit({ id: true, createdAt: true });
export type InsertGiria = z.infer<typeof insertGiriaSchema>;
export type Giria = typeof giriasTable.$inferSelect;
