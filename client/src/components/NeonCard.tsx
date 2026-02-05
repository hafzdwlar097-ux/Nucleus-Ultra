import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function NeonCard({
  title,
  icon,
  description,
  right,
  children,
  className,
  "data-testid": dataTestId,
}: {
  title: string;
  icon?: ReactNode;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <section className={cn("glass-panel neon-ring p-5 sm:p-6", className)} data-testid={dataTestId}>
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border/60 bg-card/50 shadow-sm shadow-black/20">
                <span className="text-primary drop-shadow-[0_0_16px_rgba(0,255,204,.18)]">
                  {icon}
                </span>
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg text-balance">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
        </div>

        {right ? <div className="shrink-0">{right}</div> : null}
      </header>

      <div className="mt-5">{children}</div>
    </section>
  );
}
