import { useMemo, useState } from "react";
import { type MaterialResponse } from "@shared/routes";
import { ArrowDownUp, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SortKey = "createdAt" | "strength" | "name";
type SortDir = "asc" | "desc";

function fmtDate(value: unknown) {
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
}

export function MaterialsTable({
  materials,
  title,
  "data-testid": dataTestId,
}: {
  materials: MaterialResponse[];
  title: string;
  "data-testid"?: string;
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const base = qq
      ? materials.filter((m) => {
          return (
            m.name.toLowerCase().includes(qq) ||
            m.contributor.toLowerCase().includes(qq) ||
            String(m.strength).includes(qq)
          );
        })
      : materials;

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "createdAt") {
        const ta = new Date(String(a.createdAt)).getTime();
        const tb = new Date(String(b.createdAt)).getTime();
        return (ta - tb) * dir;
      }
      if (sortKey === "strength") return (a.strength - b.strength) * dir;
      return a.name.localeCompare(b.name) * dir;
    });

    return sorted;
  }, [materials, q, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card/40 shadow-lg shadow-black/35" data-testid={dataTestId}>
      <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-display text-base">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Browse community contributions. Search, then sort by strength or recency.
          </div>
        </div>

        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={cn(
                "h-11 rounded-2xl border-2 border-border/70 bg-background/20 pl-10",
                "focus:border-primary focus:ring-4 focus:ring-primary/10",
              )}
              placeholder="Search name, contributor, strength…"
              data-testid="materials-search"
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-2xl nucleus-transition hover:-translate-y-0.5"
            onClick={() => {
              setQ("");
              setSortKey("createdAt");
              setSortDir("desc");
            }}
            data-testid="materials-clear"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-0 overflow-hidden">
        <div className="grid grid-cols-[1.4fr_.6fr_.9fr] gap-2 px-4 py-3 text-xs text-muted-foreground">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-left hover:text-foreground nucleus-transition"
            onClick={() => toggleSort("name")}
            data-testid="sort-name"
          >
            Material <ArrowDownUp className="h-3.5 w-3.5 opacity-70" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-left hover:text-foreground nucleus-transition"
            onClick={() => toggleSort("strength")}
            data-testid="sort-strength"
          >
            Strength <ArrowDownUp className="h-3.5 w-3.5 opacity-70" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-left hover:text-foreground nucleus-transition"
            onClick={() => toggleSort("createdAt")}
            data-testid="sort-created"
          >
            Added <ArrowDownUp className="h-3.5 w-3.5 opacity-70" />
          </button>
        </div>

        <div className="divide-y divide-border/60">
          {filtered.length ? (
            filtered.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[1.4fr_.6fr_.9fr] gap-2 px-4 py-3 nucleus-transition hover:bg-white/5"
                data-testid={`material-row-${m.id}`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{m.name}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    by <span className="text-foreground/90">{m.contributor}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs",
                      m.strength >= 75
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : m.strength >= 45
                          ? "border-accent/20 bg-accent/10 text-accent"
                          : "border-destructive/25 bg-destructive/10 text-destructive",
                    )}
                    data-testid={`material-strength-${m.id}`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {m.strength}/100
                  </div>
                </div>

                <div className="flex items-center justify-start text-xs text-muted-foreground" data-testid={`material-date-${m.id}`}>
                  {fmtDate(m.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground" data-testid="materials-empty">
              No materials match your search.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          <div data-testid="materials-count">
            Showing <span className="text-foreground">{filtered.length}</span> of{" "}
            <span className="text-foreground">{materials.length}</span>
          </div>
          <div data-testid="materials-sort">
            Sort: <span className="text-foreground">{sortKey}</span> ({sortDir})
          </div>
        </div>
      </div>
    </div>
  );
}
