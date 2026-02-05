import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type MaterialInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMaterials(params?: { search?: string; limit?: number }) {
  return useQuery({
    queryKey: [api.materials.list.path, params ?? {}],
    queryFn: async () => {
      const input = api.materials.list.input?.safeParse(params ?? undefined);
      if (api.materials.list.input && input && !input.success) {
        console.error("[Zod] materials.list input invalid:", input.error.format());
      }
      const sp = new URLSearchParams();
      if (params?.search) sp.set("search", params.search);
      if (params?.limit) sp.set("limit", String(params.limit));
      const url = sp.toString() ? `${api.materials.list.path}?${sp.toString()}` : api.materials.list.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch materials (${res.status})`);
      const json = await res.json();
      return parseWithLogging(api.materials.list.responses[200], json, "materials.list.responses[200]");
    },
  });
}

export function useRecentMaterials(params?: { limit?: number }) {
  return useQuery({
    queryKey: [api.materials.recent.path, params ?? {}],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.limit) sp.set("limit", String(params.limit));
      const url = sp.toString() ? `${api.materials.recent.path}?${sp.toString()}` : api.materials.recent.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch recent materials (${res.status})`);
      const json = await res.json();
      return parseWithLogging(api.materials.recent.responses[200], json, "materials.recent.responses[200]");
    },
    refetchInterval: 3500,
    refetchIntervalInBackground: false,
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: MaterialInput) => {
      const validated = api.materials.create.input.parse(data);
      const res = await fetch(api.materials.create.path, {
        method: api.materials.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json().catch(() => null);
          const parsed = api.materials.create.responses[400].safeParse(errJson);
          if (parsed.success) throw new Error(parsed.data.message);
          throw new Error("Validation error");
        }
        throw new Error(`Failed to create material (${res.status})`);
      }

      const json = await res.json();
      return parseWithLogging(api.materials.create.responses[201], json, "materials.create.responses[201]");
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: [api.materials.list.path] }),
        qc.invalidateQueries({ queryKey: [api.materials.recent.path] }),
      ]);
    },
  });
}
