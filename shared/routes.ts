import { z } from "zod";
import { insertMaterialSchema, materials } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const nucleus = {
  scanRequest: z.object({
    materialId: z.coerce.number().int().positive(),
    partRequirement: z.coerce.number().positive(),
    originalThickness: z.coerce.number().positive(),
  }),
  scanResponse: z.object({
    thicknessMm: z.number(),
    ratio: z.number(),
    ribsRequired: z.boolean(),
    hints: z.array(z.string()),
  }),
};

export const api = {
  materials: {
    list: {
      method: "GET" as const,
      path: "/api/materials",
      input: z
        .object({
          search: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).optional(),
        })
        .optional(),
      responses: {
        200: z.array(z.custom<typeof materials.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/materials",
      input: insertMaterialSchema.extend({
        strength: z.coerce.number().int().min(1).max(100),
      }),
      responses: {
        201: z.custom<typeof materials.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    recent: {
      method: "GET" as const,
      path: "/api/materials/recent",
      input: z
        .object({
          limit: z.coerce.number().int().min(1).max(50).optional(),
        })
        .optional(),
      responses: {
        200: z.array(z.custom<typeof materials.$inferSelect>()),
      },
    },
  },
  nucleus: {
    scan: {
      method: "POST" as const,
      path: "/api/nucleus/scan",
      input: nucleus.scanRequest,
      responses: {
        200: nucleus.scanResponse,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  pwa: {
    manifest: {
      method: "GET" as const,
      path: "/manifest.webmanifest",
      responses: {
        200: z.any(),
      },
    },
    serviceWorker: {
      method: "GET" as const,
      path: "/sw.js",
      responses: {
        200: z.any(),
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type MaterialInput = z.infer<typeof api.materials.create.input>;
export type MaterialResponse = z.infer<typeof api.materials.create.responses[201]>;
export type MaterialsListResponse = z.infer<
  typeof api.materials.list.responses[200]
>;
export type NucleusScanInput = z.infer<typeof api.nucleus.scan.input>;
export type NucleusScanResponse = z.infer<typeof api.nucleus.scan.responses[200]>;
export type ValidationError = z.infer<typeof errorSchemas.validation>;
export type NotFoundError = z.infer<typeof errorSchemas.notFound>;
export type InternalError = z.infer<typeof errorSchemas.internal>;
