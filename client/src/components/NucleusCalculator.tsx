import { useMemo, useState } from "react";
import { useMaterials } from "@/hooks/use-materials";
import { useNucleusScan } from "@/hooks/use-nucleus";
import { NeonCard } from "@/components/NeonCard";
import { BadgeCheck, Calculator, Layers, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function NucleusCalculator() {
  const { toast } = useToast();
  const materialsQuery = useMaterials({ limit: 100 });
  const scan = useNucleusScan();

  const [materialId, setMaterialId] = useState<string>("");
  const [partRequirement, setPartRequirement] = useState<string>("55");
  const [originalThickness, setOriginalThickness] = useState<string>("2.0");

  const selectedMaterial = useMemo(() => {
    const list = materialsQuery.data ?? [];
    const idNum = Number(materialId);
    if (!idNum) return null;
    return list.find((m) => m.id === idNum) ?? null;
  }, [materialId, materialsQuery.data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mid = Number(materialId);
    if (!mid) {
      toast({ title: "Select a material", description: "Choose a material to run the Nucleus scan." });
      return;
    }

    scan.mutate(
      {
        materialId: mid,
        partRequirement: Number(partRequirement),
        originalThickness: Number(originalThickness),
      },
      {
        onError: (err) => {
          toast({
            title: "Scan failed",
            description: err instanceof Error ? err.message : "Please check inputs and try again.",
            variant: "destructive",
          });
        },
        onSuccess: () => {
          toast({
            title: "Scan complete",
            description: "Nucleus thickness computed successfully.",
          });
        },
      },
    );
  }

  const ratio = scan.data?.ratio ?? null;
  const ribsRequired = scan.data?.ribsRequired ?? false;

  return (
    <NeonCard
      title="Nucleus Thickness Calculator"
      description="Compute minimum thickness from material strength vs part requirement — then generate structural hints."
      icon={<Calculator className="h-5 w-5" />}
      data-testid="nucleus-calculator"
      right={
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary/80" />
          <span>Neon logic v1</span>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4" data-testid="nucleus-form">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <Label className="text-sm text-muted-foreground" htmlFor="material" data-testid="label-material">
              Material
            </Label>
            <div className="mt-2">
              <Select value={materialId} onValueChange={setMaterialId}>
                <SelectTrigger
                  id="material"
                  className="h-12 rounded-2xl border-2 border-border/70 bg-background/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  data-testid="input-material"
                >
                  <SelectValue placeholder={materialsQuery.isLoading ? "Loading materials…" : "Choose a material"} />
                </SelectTrigger>
                <SelectContent className="border-border/70 bg-popover/95 backdrop-blur-xl">
                  {(materialsQuery.data ?? []).map((m) => (
                    <SelectItem key={m.id} value={String(m.id)} data-testid={`material-option-${m.id}`}>
                      {m.name} — {m.strength}/100
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {materialsQuery.isError ? (
                <p className="mt-2 text-xs text-destructive" data-testid="materials-error">
                  Failed to load materials. Ensure /api/materials is available.
                </p>
              ) : null}
            </div>
          </div>

          <div className="md:col-span-1">
            <Label className="text-sm text-muted-foreground" htmlFor="requirement" data-testid="label-requirement">
              Part requirement (1–100)
            </Label>
            <Input
              id="requirement"
              inputMode="numeric"
              type="number"
              min={1}
              max={100}
              step={1}
              value={partRequirement}
              onChange={(e) => setPartRequirement(e.target.value)}
              className="mt-2 h-12 rounded-2xl border-2 border-border/70 bg-background/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="e.g. 60"
              data-testid="input-requirement"
            />
          </div>

          <div className="md:col-span-1">
            <Label className="text-sm text-muted-foreground" htmlFor="thickness" data-testid="label-thickness">
              Original thickness (mm)
            </Label>
            <Input
              id="thickness"
              inputMode="decimal"
              type="number"
              min={0.1}
              step={0.1}
              value={originalThickness}
              onChange={(e) => setOriginalThickness(e.target.value)}
              className="mt-2 h-12 rounded-2xl border-2 border-border/70 bg-background/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="e.g. 2.0"
              data-testid="input-original-thickness"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="material-summary">
            <Layers className="h-4 w-4 text-primary/80" />
            <span>
              Selected:{" "}
              <span className="text-foreground">
                {selectedMaterial ? `${selectedMaterial.name} (${selectedMaterial.strength}/100)` : "—"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={scan.isPending || materialsQuery.isLoading}
              className={cn(
                "h-12 rounded-2xl px-5 font-semibold nucleus-transition",
                "bg-gradient-to-r from-primary/95 to-accent/70 text-primary-foreground",
                "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5",
                "active:translate-y-0 active:shadow-md",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
              )}
              data-testid="btn-run-scan"
            >
              {scan.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
                </span>
              ) : (
                "Run Nucleus Scan"
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => scan.reset()}
              className="h-12 rounded-2xl px-4 nucleus-transition hover:-translate-y-0.5"
              data-testid="btn-reset-scan"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-background/20 p-4 shadow-sm shadow-black/20 md:col-span-1">
            <div className="text-xs text-muted-foreground">Recommended thickness</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="font-display text-2xl text-primary neon-text" data-testid="result-thickness">
                {scan.data ? scan.data.thicknessMm.toFixed(2) : "—"}
              </div>
              <div className="text-sm text-muted-foreground">mm</div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Ratio = material / requirement
            </div>
            <div className="mt-1 text-sm" data-testid="result-ratio">
              {ratio !== null ? (
                <span className={cn(ratio >= 1 ? "text-foreground" : "text-destructive/90")}>
                  {ratio.toFixed(3)}
                </span>
              ) : (
                "—"
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-background/20 p-4 shadow-sm shadow-black/20 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Structural assist</div>
                <div className="mt-1 font-display text-lg" data-testid="result-structural-title">
                  {scan.data ? (ribsRequired ? "Reinforcement recommended" : "Baseline stiffness OK") : "—"}
                </div>
              </div>

              {scan.data ? (
                ribsRequired ? (
                  <div
                    className="inline-flex items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                    data-testid="badge-ribs-required"
                  >
                    <TriangleAlert className="h-4 w-4" />
                    Add ribs
                  </div>
                ) : (
                  <div
                    className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary"
                    data-testid="badge-ribs-not-required"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Stable
                  </div>
                )
              ) : (
                <div className="h-9 w-24 rounded-2xl shimmer" aria-hidden />
              )}
            </div>

            <div className="mt-4 grid gap-2">
              {(scan.data?.hints ?? []).length ? (
                <ul className="grid gap-2" data-testid="result-hints">
                  {scan.data!.hints.map((h, idx) => (
                    <li
                      key={`${h}-${idx}`}
                      className={cn(
                        "rounded-2xl border bg-card/30 px-4 py-3 text-sm nucleus-transition",
                        ribsRequired
                          ? "border-primary/25 hover:border-primary/40 hover:bg-primary/5"
                          : "border-border/60 hover:border-primary/20 hover:bg-white/5",
                      )}
                      data-testid={`hint-${idx}`}
                    >
                      <span className={cn("font-medium", ribsRequired ? "text-primary neon-text" : "text-foreground")}>
                        {ribsRequired ? "Suggestion: " : "Hint: "}
                      </span>
                      <span className="text-muted-foreground">{h}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-card/30 p-4 text-sm text-muted-foreground" data-testid="result-hints-empty">
                  Run a scan to generate structural hints.
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </NeonCard>
  );
}
