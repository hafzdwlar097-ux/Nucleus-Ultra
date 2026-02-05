import { useMemo } from "react";
import { useMaterials, useRecentMaterials } from "@/hooks/use-materials";
import { NeonCard } from "@/components/NeonCard";
import { MaterialCreateDialog } from "@/components/MaterialCreateDialog";
import { MaterialsTable } from "@/components/MaterialsTable";
import { Activity, Hexagon, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@shared/routes";
import { useQueryClient } from "@tanstack/react-query";

function FeedItem({
  name,
  strength,
  contributor,
  createdAt,
  testId,
}: {
  name: string;
  strength: number;
  contributor: string;
  createdAt: unknown;
  testId: string;
}) {
  const date = new Date(String(createdAt));
  const when = Number.isNaN(date.getTime())
    ? "—"
    : new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
        Math.round((date.getTime() - Date.now()) / 60000),
        "minute",
      );

  return (
    <div
      className="rounded-3xl border border-border/60 bg-background/20 p-4 nucleus-transition hover:bg-white/5"
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{name}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            by <span className="text-foreground/90">{contributor}</span>
          </div>
        </div>
        <div className="shrink-0 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary">
          {strength}/100
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        added <span className="text-foreground/90">{when}</span>
      </div>
    </div>
  );
}

export default function HivePage() {
  const qc = useQueryClient();
  const recent = useRecentMaterials({ limit: 12 });
  const all = useMaterials({ limit: 100 });

  const merged = useMemo(() => {
    // Prefer recent, but show list nicely even if only one endpoint available
    const r = recent.data ?? [];
    const a = all.data ?? [];
    const map = new Map<number, (typeof r)[number]>();
    [...r, ...a].forEach((m) => map.set(m.id, m));
    return Array.from(map.values()).sort(
      (x, y) => new Date(String(y.createdAt)).getTime() - new Date(String(x.createdAt)).getTime(),
    );
  }, [recent.data, all.data]);

  return (
    <div className="grid gap-5 md:gap-6" data-testid="page-hive">
      <NeonCard
        title="Hive"
        description="An open-source community feed for local materials — contribute, learn, and iterate."
        icon={<Hexagon className="h-5 w-5" />}
        data-testid="hive-hero"
        right={<MaterialCreateDialog triggerLabel="Add material" />}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: <Users className="h-4 w-4" />, title: "Community", text: "Local, open-source, evolving." },
            { icon: <Activity className="h-4 w-4" />, title: "Live feed", text: "Auto-refreshes every few seconds." },
            { icon: <Hexagon className="h-4 w-4" />, title: "Lab-ready", text: "Use materials in Nucleus scans." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border/60 bg-background/20 p-4 shadow-sm shadow-black/25 nucleus-transition hover:bg-white/5"
              data-testid={`hive-feature-${f.title.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="flex items-center gap-2 text-primary">
                {f.icon}
                <div className="font-display">{f.title}</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{f.text}</div>
            </div>
          ))}
        </div>
      </NeonCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]" data-testid="hive-main">
        <div className="rounded-3xl border border-border/60 bg-card/40 shadow-lg shadow-black/35">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 p-4">
            <div>
              <div className="font-display text-base">Recent additions</div>
              <div className="mt-1 text-xs text-muted-foreground">Live feed (newest first).</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-11 rounded-2xl nucleus-transition hover:-translate-y-0.5"
                onClick={() => void qc.invalidateQueries({ queryKey: [api.materials.recent.path] })}
                data-testid="btn-refresh-recent"
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-3 p-4">
            {recent.isLoading ? (
              <div className="grid place-items-center rounded-3xl border border-border/60 bg-background/20 p-10 text-sm text-muted-foreground" data-testid="recent-loading">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading recent materials…
                </div>
              </div>
            ) : recent.isError ? (
              <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" data-testid="recent-error">
                Failed to load live feed. Ensure <span className="font-mono">GET /api/materials/recent</span> is available.
              </div>
            ) : (recent.data ?? []).length ? (
              (recent.data ?? []).map((m) => (
                <FeedItem
                  key={m.id}
                  name={m.name}
                  strength={m.strength}
                  contributor={m.contributor}
                  createdAt={m.createdAt}
                  testId={`recent-item-${m.id}`}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-border/60 bg-background/20 p-6 text-center text-sm text-muted-foreground" data-testid="recent-empty">
                No recent materials yet. Be the first to contribute.
              </div>
            )}
          </div>
        </div>

        <MaterialsTable materials={merged} title="Materials index" data-testid="materials-table" />
      </div>
    </div>
  );
}
