import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type NucleusScanInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useNucleusScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NucleusScanInput) => {
      const validated = api.nucleus.scan.input.parse(input);
      const res = await fetch(api.nucleus.scan.path, {
        method: api.nucleus.scan.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json().catch(() => null);
          const parsed = api.nucleus.scan.responses[400].safeParse(errJson);
          if (parsed.success) throw new Error(parsed.data.message);
          throw new Error("Invalid scan input");
        }
        if (res.status === 404) {
          const errJson = await res.json().catch(() => null);
          const parsed = api.nucleus.scan.responses[404].safeParse(errJson);
          if (parsed.success) throw new Error(parsed.data.message);
          throw new Error("Not found");
        }
        throw new Error(`Scan failed (${res.status})`);
      }

      const json = await res.json();
      return parseWithLogging(api.nucleus.scan.responses[200], json, "nucleus.scan.responses[200]");
    },
    onSuccess: async () => {
      // keep app fresh; scanning can imply new recommendations tied to materials
      await qc.invalidateQueries({ queryKey: [api.materials.list.path] });
    },
  });
}
