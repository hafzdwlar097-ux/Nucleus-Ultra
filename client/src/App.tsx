import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppShell } from "@/components/AppShell";
import HomeRedirect from "@/pages/HomeRedirect";
import LabPage from "@/pages/LabPage";
import HivePage from "@/pages/HivePage";
import NotFoundPage from "@/pages/NotFoundPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/lab" component={LabPage} />
      <Route path="/hive" component={HivePage} />

      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppShell>
          <Router />
        </AppShell>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
