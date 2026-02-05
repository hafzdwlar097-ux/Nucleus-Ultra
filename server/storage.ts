import { db } from "./db";
import { materials, type CreateMaterialRequest, type MaterialResponse } from "@shared/schema";
import { desc, ilike } from "drizzle-orm";

export interface IStorage {
  listMaterials(input?: { search?: string; limit?: number }): Promise<MaterialResponse[]>;
  listRecentMaterials(input?: { limit?: number }): Promise<MaterialResponse[]>;
  createMaterial(input: CreateMaterialRequest): Promise<MaterialResponse>;
  getMaterialById(id: number): Promise<MaterialResponse | undefined>;
}

export class DatabaseStorage implements IStorage {
  async listMaterials(input?: { search?: string; limit?: number }): Promise<MaterialResponse[]> {
    const limit = input?.limit ?? 100;

    if (input?.search && input.search.trim().length > 0) {
      return await db
        .select()
        .from(materials)
        .where(ilike(materials.name, `%${input.search.trim()}%`))
        .orderBy(desc(materials.createdAt))
        .limit(limit);
    }

    return await db
      .select()
      .from(materials)
      .orderBy(desc(materials.createdAt))
      .limit(limit);
  }

  async listRecentMaterials(input?: { limit?: number }): Promise<MaterialResponse[]> {
    const limit = input?.limit ?? 20;
    return await db
      .select()
      .from(materials)
      .orderBy(desc(materials.createdAt))
      .limit(limit);
  }

  async createMaterial(input: CreateMaterialRequest): Promise<MaterialResponse> {
    const [created] = await db.insert(materials).values(input).returning();
    return created;
  }

  async getMaterialById(id: number): Promise<MaterialResponse | undefined> {
    const [found] = await db.select().from(materials).where((m, { eq }) => eq(m.id, id)).limit(1);
    return found;
  }
}

export const storage = new DatabaseStorage();
