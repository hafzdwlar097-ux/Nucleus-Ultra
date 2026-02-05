import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { useCreateMaterial } from "@/hooks/use-materials";
import { type MaterialInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function clampStrength(v: number) {
  if (Number.isNaN(v)) return 1;
  return Math.max(1, Math.min(100, v));
}

export function MaterialCreateDialog({ triggerLabel = "Add material" }: { triggerLabel?: string }) {
  const { toast } = useToast();
  const create = useCreateMaterial();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [strength, setStrength] = useState("72");
  const [contributor, setContributor] = useState("");

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && contributor.trim().length >= 2 && clampStrength(Number(strength)) >= 1;
  }, [name, contributor, strength]);

  useEffect(() => {
    if (!open) {
      create.reset();
    }
  }, [open, create]);

  function resetForm() {
    setName("");
    setStrength("72");
    setContributor("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: MaterialInput = {
      name: name.trim(),
      strength: clampStrength(Number(strength)),
      contributor: contributor.trim(),
    };

    create.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Material added",
          description: "Your contribution is now in the Hive feed.",
        });
        setOpen(false);
        resetForm();
      },
      onError: (err) => {
        toast({
          title: "Couldn’t add material",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-12 rounded-2xl px-4 font-semibold nucleus-transition bg-gradient-to-r from-primary/95 to-accent/70 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
          data-testid="btn-open-add-material"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-3xl border-border/70 bg-popover/90 backdrop-blur-xl shadow-2xl shadow-black/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-display">Contribute a local material</span>
            <Sparkles className="h-4 w-4 text-primary/80" />
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a name, a relative strength score (1–100), and your contributor handle.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-2 grid gap-4" data-testid="form-add-material">
          <div className="grid gap-2">
            <Label htmlFor="mat-name" data-testid="label-mat-name">
              Name
            </Label>
            <Input
              id="mat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-2xl border-2 border-border/70 bg-background/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="e.g. Recycled Carbon-Fiber PLA"
              data-testid="input-mat-name"
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2 md:items-end">
            <div className="grid gap-2">
              <Label htmlFor="mat-strength" data-testid="label-mat-strength">
                Strength (1–100)
              </Label>
              <Input
                id="mat-strength"
                type="number"
                min={1}
                max={100}
                step={1}
                inputMode="numeric"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="h-12 rounded-2xl border-2 border-border/70 bg-background/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
                data-testid="input-mat-strength"
              />
              <div className="text-xs text-muted-foreground" data-testid="strength-hint">
                Higher = stronger. Keep it consistent within your lab.
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mat-contributor" data-testid="label-mat-contributor">
                Contributor
              </Label>
              <Input
                id="mat-contributor"
                value={contributor}
                onChange={(e) => setContributor(e.target.value)}
                className="h-12 rounded-2xl border-2 border-border/70 bg-background/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="@handle"
                data-testid="input-mat-contributor"
              />
            </div>
          </div>

          {create.isError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="add-material-error">
              {create.error instanceof Error ? create.error.message : "Failed to create material."}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              className="h-12 rounded-2xl px-4 nucleus-transition hover:-translate-y-0.5"
              data-testid="btn-cancel-add-material"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || create.isPending}
              className="h-12 rounded-2xl px-5 font-semibold nucleus-transition bg-gradient-to-r from-primary/95 to-accent/70 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              data-testid="btn-submit-add-material"
            >
              {create.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding…
                </span>
              ) : (
                "Add to Hive"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
