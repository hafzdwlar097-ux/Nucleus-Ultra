import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import { api } from "@shared/routes";
import { storage } from "./storage";

function nucleusHints(ratio: number): string[] {
  const hints: string[] = [];

  if (ratio < 0.6) {
    hints.push("Add X-ribs across the span");
    hints.push("Increase fillet radii at corners to reduce stress concentration");
    hints.push("Add a closed-section rib or box-beam feature where possible");
    hints.push("Reduce unsupported length (add standoffs or intermediate supports)");
  } else if (ratio < 0.85) {
    hints.push("Add 2-3 longitudinal ribs");
    hints.push("Thicken around fasteners and load paths");
    hints.push("Add gussets at joints");
  } else if (ratio < 1.0) {
    hints.push("Add light ribbing near high-stress areas");
    hints.push("Keep consistent wall thickness and avoid sharp internal corners");
  } else {
    hints.push("Maintain uniform thickness to avoid warping");
    hints.push("Consider weight-reduction pockets while keeping rib support");
  }

  return hints;
}

async function seedDatabase(): Promise<void> {
  const existing = await storage.listMaterials({ limit: 1 });
  if (existing.length > 0) return;

  await storage.createMaterial({
    name: "Industrial Steel",
    strength: 100,
    contributor: "System",
  });

  await storage.createMaterial({
    name: "Engineered Bamboo Composite",
    strength: 60,
    contributor: "Core Team",
  });

  await storage.createMaterial({
    name: "Recycled HDPE",
    strength: 35,
    contributor: "Green Lab",
  });

  await storage.createMaterial({
    name: "Palm Fiber Laminate",
    strength: 45,
    contributor: "Community",
  });

  await storage.createMaterial({
    name: "Hemp Fiber Reinforced Polymer",
    strength: 70,
    contributor: "Open Materials Guild",
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  void seedDatabase();

  app.get(api.materials.list.path, async (req, res) => {
    const input = api.materials.list.input?.safeParse(req.query);
    const parsed = input?.success ? input.data : undefined;

    const items = await storage.listMaterials({
      search: parsed?.search,
      limit: parsed?.limit,
    });

    res.json(items);
  });

  app.get(api.materials.recent.path, async (req, res) => {
    const input = api.materials.recent.input?.safeParse(req.query);
    const parsed = input?.success ? input.data : undefined;

    const items = await storage.listRecentMaterials({ limit: parsed?.limit });
    res.json(items);
  });

  app.post(api.materials.create.path, async (req, res) => {
    try {
      const body = api.materials.create.input.parse(req.body);
      const created = await storage.createMaterial(body);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid request",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.post(api.nucleus.scan.path, async (req, res) => {
    try {
      const body = api.nucleus.scan.input.parse(req.body);
      const material = await storage.getMaterialById(body.materialId);

      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }

      const ratio = material.strength / body.partRequirement;
      const ribsRequired = ratio < 1;

      let factor = 1;
      if (ratio > 0 && ratio < 1) {
        factor = 1 / Math.sqrt(ratio);
      }

      const thicknessMm = Math.round(body.originalThickness * factor * 10) / 10;

      const response = {
        thicknessMm,
        ratio: Math.round(ratio * 1000) / 1000,
        ribsRequired,
        hints: nucleusHints(ratio),
      };

      res.json(response);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid request",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.get(api.pwa.manifest.path, async (_req, res) => {
    res.json({
      short_name: "NUCLEUS ULTRA",
      name: "NUCLEUS ULTRA",
      icons: [
        {
          src: "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
          type: "image/png",
          sizes: "512x512",
          purpose: "any maskable",
        },
      ],
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#0b0f14",
      theme_color: "#00ffcc",
    });
  });

  app.get(api.pwa.serviceWorker.path, async (_req, res) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.send(`/* NUCLEUS ULTRA service worker */
const CACHE_NAME = 'nucleus-ultra-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Network-first for API GETs
  if (url.pathname.startsWith('/api/') && req.method === 'GET') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
`);
  });

  return httpServer;
}
