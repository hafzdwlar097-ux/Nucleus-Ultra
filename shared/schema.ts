import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  strength: integer("strength").notNull(),
  contributor: text("contributor").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type CreateMaterialRequest = InsertMaterial;
export type UpdateMaterialRequest = Partial<InsertMaterial>;
export type MaterialResponse = Material;
export type MaterialsListResponse = Material[];

export type NucleusScanRequest = {
  materialId: number;
  partRequirement: number;
  originalThickness: number;
};

export type NucleusScanResponse = {
  thicknessMm: number;
  ratio: number;
  ribsRequired: boolean;
  hints: string[];
};
