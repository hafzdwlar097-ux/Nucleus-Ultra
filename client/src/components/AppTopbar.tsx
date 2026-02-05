import { Link, useLocation } from "wouter";
import { Sparkles, Zap } from "lucide-react";

const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/1005/1005141.png";

export function AppTopbar() {
  const [location] = useLocation();
  const isLab = !location.startsWith("/hive");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/40 backdrop-blur-xl">
      <div className="nucleus-container py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/lab"
            className="group flex items-center gap-3 nucleus-transition hover:opacity-95"
            data-testid="topbar-home"
          >
            <div className="relative">
              <div
                className="absolute -inset-2 rounded-2xl opacity-0 blur-md nucleus-transition group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, hsl(var(--primary)/.35), transparent 60%)",
                }}
              />
              <img
                src={LOGO_URL}
                alt="NUCLEUS ULTRA logo"
                className="relative h-10 w-10 rounded-2xl border border-border/60 bg-card/70 p-1.5 shadow-lg shadow-black/30"
              />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-display text-base sm:text-lg tracking-tight">
                  NUCLEUS <span className="neon-text text-primary">ULTRA</span>
                </span>
                <Zap className="h-4 w-4 text-primary/90 drop-shadow-[0_0_12px_rgba(0,255,204,.30)]" />
              </div>
              <div className="text-xs text-muted-foreground">
                sustainable engineering interface
              </div>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-border/60 bg-card/40 px-3 py-2 shadow-sm shadow-black/20">
            <div
              className={`h-2 w-2 rounded-full ${isLab ? "bg-primary" : "bg-accent"} shadow-[0_0_16px_rgba(0,255,204,.35)]`}
            />
            <div className="text-xs text-muted-foreground">
              Mode:{" "}
              <span className="text-foreground font-medium">
                {isLab ? "Lab / Scanner" : "Hive / Community"}
              </span>
            </div>
            <Sparkles className="h-4 w-4 text-primary/80" />
          </div>
        </div>
      </div>
    </header>
  );
}
