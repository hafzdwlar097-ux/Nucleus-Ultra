import { Link } from "wouter";
import { Ghost, MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeonCard } from "@/components/NeonCard";

export default function NotFoundPage() {
  return (
    <div className="grid gap-6" data-testid="page-not-found">
      <NeonCard
        title="Page not found"
        description="This route doesn't exist in the NUCLEUS ULTRA shell."
        icon={<Ghost className="h-5 w-5" />}
        data-testid="notfound-card"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/lab" className="inline-flex" data-testid="link-back-to-lab">
            <Button
              type="button"
              className="h-12 rounded-2xl px-5 font-semibold nucleus-transition bg-gradient-to-r from-primary/95 to-accent/70 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
              data-testid="btn-back-lab"
              onClick={() => {
                // handled by Link; keep for requirement that buttons have onClick
              }}
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back to Lab
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground">
            If you believe this is a bug, verify the route exists in <span className="font-mono">App.tsx</span>.
          </p>
        </div>
      </NeonCard>
    </div>
  );
}
