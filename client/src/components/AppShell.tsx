import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { AppTopbar } from "@/components/AppTopbar";
import { registerServiceWorker } from "@/components/pwa/registerServiceWorker";

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    // Default dark theme
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    // SEO basics
    const title = location.startsWith("/hive") ? "NUCLEUS ULTRA — Hive" : "NUCLEUS ULTRA — Lab";
    document.title = title;

    const desc = "NUCLEUS ULTRA is a sustainable engineering platform: scan, calculate thickness, and collaborate on local materials.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;

    let theme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      document.head.appendChild(theme);
    }
    theme.content = "#00ffcc";

    // Manifest link (installability)
    let manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!manifest) {
      manifest = document.createElement("link");
      manifest.rel = "manifest";
      manifest.href = "/manifest.webmanifest";
      document.head.appendChild(manifest);
    }
  }, [location]);

  return (
    <div className="min-h-dvh nucleus-surface">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-70" />
      </div>

      <AppTopbar />

      <main className="nucleus-container pb-[calc(92px+var(--safe-bottom))] pt-6 md:pt-10">
        <div className="animate-float-in">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}
