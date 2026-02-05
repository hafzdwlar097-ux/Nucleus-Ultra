import { Link, useLocation } from "wouter";
import { FlaskConical, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function NavItem({
  href,
  label,
  icon,
  active,
  testId,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  testId: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 nucleus-transition nucleus-focus",
        "hover:bg-white/5 active:scale-[0.99]",
        active ? "text-foreground" : "text-muted-foreground",
      )}
      data-testid={testId}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 nucleus-transition",
          active && "opacity-100",
        )}
        style={{
          background:
            "radial-gradient(120px 80px at 50% 20%, hsl(var(--primary)/.16), transparent 70%)",
        }}
      />
      <div
        className={cn(
          "relative grid place-items-center rounded-2xl border px-4 py-2 nucleus-transition",
          active
            ? "border-primary/30 bg-primary/10 shadow-[0_0_32px_rgba(0,255,204,.12)]"
            : "border-border/60 bg-card/40 group-hover:border-primary/25 group-hover:bg-primary/5",
        )}
      >
        <div
          className={cn(
            "nucleus-transition",
            active ? "text-primary" : "text-muted-foreground group-hover:text-primary/90",
          )}
        >
          {icon}
        </div>
      </div>
      <div className={cn("relative text-xs font-medium", active && "neon-text")}>{label}</div>
    </Link>
  );
}

export function BottomNav() {
  const [location] = useLocation();
  const isLab = location === "/" || location.startsWith("/lab");
  const isHive = location.startsWith("/hive");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/50 backdrop-blur-xl"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Bottom navigation"
      data-testid="bottom-nav"
    >
      <div className="nucleus-container py-3">
        <div className="flex items-stretch gap-3 rounded-3xl border border-border/60 bg-card/40 p-2 shadow-lg shadow-black/40">
          <NavItem
            href="/lab"
            label="Lab"
            icon={<FlaskConical className="h-5 w-5" />}
            active={isLab}
            testId="nav-lab"
          />
          <NavItem
            href="/hive"
            label="Hive"
            icon={<Users className="h-5 w-5" />}
            active={isHive}
            testId="nav-hive"
          />
        </div>
      </div>
    </nav>
  );
}
