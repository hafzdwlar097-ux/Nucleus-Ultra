import { ScannerPanel } from "@/components/ScannerPanel";
import { NucleusCalculator } from "@/components/NucleusCalculator";
import { NeonCard } from "@/components/NeonCard";
import { FlaskConical, Leaf, Radar } from "lucide-react";

export default function LabPage() {
  return (
    <div className="grid gap-5 md:gap-6" data-testid="page-lab">
      <NeonCard
        title="Lab"
        description="Scan, simulate, and calculate sustainable structural thickness — powered by Nucleus logic."
        icon={<FlaskConical className="h-5 w-5" />}
        data-testid="lab-hero"
        right={
          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
            <Leaf className="h-4 w-4" />
            Sustainable by design
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: <Radar className="h-4 w-4" />,
              title: "Scan",
              text: "Optional camera preview with a neon scan-line overlay.",
            },
            {
              icon: <FlaskConical className="h-4 w-4" />,
              title: "Compute",
              text: "Get thickness in mm from material strength vs requirement.",
            },
            {
              icon: <Leaf className="h-4 w-4" />,
              title: "Optimize",
              text: "If weak, get structural hints like ribs & fillets.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border/60 bg-background/20 p-4 shadow-sm shadow-black/25 nucleus-transition hover:bg-white/5"
              data-testid={`lab-feature-${f.title.toLowerCase()}`}
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

      <ScannerPanel />

      <NucleusCalculator />
    </div>
  );
}
