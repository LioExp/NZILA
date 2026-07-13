import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@workspace/replit-auth-web";
import { ProfileProvider, useProfile } from "@/contexts/profile-context";
import { OnboardingModal } from "@/components/onboarding-modal";

import Chat from "@/pages/chat";
import Girias from "@/pages/girias";
import Contribuir from "@/pages/contribuir";
import Benchmark from "@/pages/benchmark";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();

  const handleOnboardingComplete = async (data: { isAngolan: boolean; country: string }) => {
    await updateProfile({ ...data, onboardingDone: true });
  };

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  if (authLoading || (isAuthenticated && profileLoading && !profile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 opacity-70">
            <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar user={user} isAngolan={profile?.isAngolan ?? null} />
        <main className="flex-1 relative flex flex-col min-w-0">
          <Router />
        </main>
      </div>

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
          <ProfileProvider>
            <AppShell />
          </ProfileProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
