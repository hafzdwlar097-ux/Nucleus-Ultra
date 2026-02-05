import { useEffect } from "react";
import { useLocation } from "wouter";

export default function HomeRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/lab");
  }, [navigate]);

  return (
    <div className="grid place-items-center py-20 text-sm text-muted-foreground" data-testid="page-home-redirect">
      Redirecting…
    </div>
  );
}
