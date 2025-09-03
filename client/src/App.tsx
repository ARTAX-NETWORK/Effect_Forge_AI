import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomCursor } from "@/components/ui/cursor";
import { ParticleBackground } from "@/components/ui/particles";
import { FloatingNavigation } from "@/components/navigation/floating-nav";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Generator from "@/pages/generator";
import Library from "@/pages/library";
import Preview from "@/pages/preview";
import Status from "@/pages/status";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <FloatingNavigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/upload" component={Upload} />
        <Route path="/generator" component={Generator} />
        <Route path="/library" component={Library} />
        <Route path="/preview" component={Preview} />
        <Route path="/status" component={Status} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CustomCursor />
        <ParticleBackground />
        <div className="min-h-screen relative">
          <Router />
          
          {/* Footer */}
          <footer className="text-center py-8 text-muted-foreground text-sm border-t border-border">
            <p className="mb-2">EffectForge AI - Digital Forge of the Future</p>
            <p className="text-xs opacity-60">
              Powered by DAAR Methodology • Constitutional Excellence • Local Intelligence
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-xs">
              <span className="text-primary">Zero Dependencies</span>
              <span className="text-accent">60fps Performance</span>
              <span className="text-yellow-400">99.99% Uptime</span>
              <span className="text-green-400">Military Precision</span>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
