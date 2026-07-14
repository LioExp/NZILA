import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProfileProvider, useProfile } from "@/contexts/profile-context";
import { OnboardingModal } from "@/components/onboarding-modal";

import { ErrorBoundary } from "@/components/error-boundary";
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
  const { user, isLoading } = useAuth();
  const { profile, updateProfile } = useProfile();

  const handleOnboardingComplete = (data: { isAngolan: boolean; country: string }) => {
    updateProfile({ ...data, onboardingDone: true });
  };

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 opacity-60">
          <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar user={user} isAngolan={profile?.isAngolan ?? null} />
        <main className="flex-1 relative flex flex-col min-w-0">
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </main>
      </div>

      {profile && !profile.onboardingDone && (
        <OnboardingModal
          userName={user.firstName}
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
          <AuthProvider>
            <ProfileProvider>
              <AppShell />
            </ProfileProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
