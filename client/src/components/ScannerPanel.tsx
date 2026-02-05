import { useEffect, useRef, useState } from "react";
import { Camera, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CameraState = "idle" | "requesting" | "active" | "denied" | "error";

export function ScannerPanel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState("idle");
  }

  async function start() {
    setErrorMsg("");
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("active");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Camera access failed";
      setErrorMsg(msg);
      // heuristics
      const denied = /denied|permission/i.test(msg);
      setState(denied ? "denied" : "error");
    }
  }

  useEffect(() => {
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = state === "active";

  return (
    <div className="grid gap-4 md:grid-cols-[1.2fr_.8fr]" data-testid="scanner-panel">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 shadow-lg shadow-black/40">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(900px 500px at 20% -10%, hsl(var(--primary)/.14), transparent 65%), radial-gradient(900px 500px at 120% 0%, hsl(var(--accent)/.10), transparent 60%)",
          }}
        />
        <div className="relative aspect-[4/3] w-full">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                className="h-full w-full object-cover opacity-90"
                playsInline
                muted
                data-testid="scanner-video"
              />
              <div className="scanline" aria-hidden />
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-3xl border border-border/60 bg-background/30 shadow-md shadow-black/30">
                {state === "denied" || state === "error" ? (
                  <ShieldAlert className="h-7 w-7 text-destructive" />
                ) : (
                  <Camera className="h-7 w-7 text-primary" />
                )}
              </div>

              <div>
                <div className="font-display text-lg">AI Camera Scanner</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {state === "requesting"
                    ? "Requesting camera access…"
                    : state === "denied"
                      ? "Camera permission denied. You can still run Nucleus calculations."
                      : state === "error"
                        ? "Camera unavailable on this device/browser."
                        : "Simulated scan interface. Optional live camera preview."}
                </p>
                {errorMsg ? (
                  <p className="mt-2 text-xs text-destructive/90" data-testid="scanner-error">
                    {errorMsg}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  onClick={() => void start()}
                  disabled={state === "requesting"}
                  className={cn(
                    "rounded-2xl px-5 py-5 text-sm font-semibold nucleus-transition",
                    "bg-gradient-to-r from-primary/95 to-accent/70 text-primary-foreground",
                    "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5",
                    "active:translate-y-0 active:shadow-md",
                    "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
                  )}
                  data-testid="scanner-start"
                >
                  Start camera
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void stop()}
                  className="rounded-2xl px-5 py-5 nucleus-transition hover:-translate-y-0.5"
                  data-testid="scanner-stop"
                >
                  Stop
                </Button>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-3 rounded-[1.6rem] border border-primary/15 shadow-[0_0_0_1px_rgba(0,255,204,.08)_inset]">
            <div className="absolute inset-0 rounded-[1.6rem] bg-gradient-to-b from-white/5 to-transparent opacity-60" />
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary/80" />
            <span data-testid="scanner-status">
              {isActive ? "Live feed: active" : "Live feed: offline (simulated)"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Scan-line <span className="text-foreground">enabled</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/40 p-5 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between">
          <div className="font-display text-base">Signal</div>
          <div className="text-xs text-muted-foreground">simulated diagnostics</div>
        </div>

        <div className="mt-4 grid gap-3">
          {[
            { k: "Edge detection", v: isActive ? "locked" : "standby", on: isActive },
            { k: "Material inference", v: isActive ? "sampling" : "offline", on: isActive },
            { k: "Structural heuristics", v: "ready", on: true },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/20 px-4 py-3"
              data-testid={`scanner-diag-${row.k.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="text-sm">{row.k}</div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    row.on ? "bg-primary shadow-[0_0_14px_rgba(0,255,204,.35)]" : "bg-muted-foreground/40",
                  )}
                />
                <span className={cn(row.on ? "text-foreground" : "text-muted-foreground")}>
                  {row.v}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Tip: If camera is blocked, continue with the Nucleus thickness calculator below.
        </p>
      </div>
    </div>
  );
}
