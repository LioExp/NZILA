import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@workspace/replit-auth-web";
import { OnboardingModal } from "@/components/onboarding-modal";

// Pages
import Chat from "@/pages/chat";
import Girias from "@/pages/girias";
import Contribuir from "@/pages/contribuir";
import Benchmark from "@/pages/benchmark";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Chat} />
      <Route path="/girias" component={Girias} />
      <Route path="/contribuir" component={Contribuir} />
      <Route path="/benchmark" component={Benchmark} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<{ onboardingDone: boolean; country: string | null; isAngolan: boolean | null } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !profile) {
      setProfileLoading(true);
      fetch("/api/profile", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setProfileLoading(false);
        })
        .catch(() => setProfileLoading(false));
    }
  }, [isAuthenticated, profile]);

  const handleOnboardingComplete = async (data: { isAngolan: boolean; country: string }) => {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...data, onboardingDone: true }),
    });
    setProfile((prev) => ({ ...(prev ?? { country: null, isAngolan: null }), ...data, onboardingDone: true }));
  };

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isLoading || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16">
            <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar user={user} />
        <main className="flex-1 relative flex flex-col min-w-0">
          <Router />
        </main>
      </div>
      {/* Onboarding modal - shown after first login */}
      {profile && !profile.onboardingDone && (
        <OnboardingModal
          userName={user?.firstName ?? null}
          onComplete={handleOnboardingComplete}
        />
      )}
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppShell />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
