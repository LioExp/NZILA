import { BookOpen, MessageSquare, PenTool, BarChart2, PlusCircle, History, LogOut, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListOpenaiConversations } from "@workspace/api-client-react";
import { useChatStore } from "@/hooks/use-chat-history";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { format } from "date-fns";

interface AppSidebarProps {
  user: { firstName: string; email: string; profileImageUrl: string | null } | null;
  isAngolan: boolean | null;
}

export function AppSidebar({ user, isAngolan }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const { data: conversations } = useListOpenaiConversations();
  const { clearMessages } = useChatStore();
  const { logout } = useAuth();

  const allNavItems = [
    { title: "Chat", url: "/", icon: MessageSquare, angolanOnly: false },
    { title: "Dicionário", url: "/girias", icon: BookOpen, angolanOnly: false },
    { title: "Contribuir", url: "/contribuir", icon: PenTool, angolanOnly: true },
    { title: "Benchmark", url: "/benchmark", icon: BarChart2, angolanOnly: false },
  ];

  const navItems = allNavItems.filter((item) => !item.angolanOnly || isAngolan === true);

  const handleNewChat = () => {
    clearMessages();
    setLocation("/");
  };

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar">
      <SidebarHeader className="p-4 pb-3">
        <div className="flex items-center gap-2.5 px-1 mb-4">
          <div className="w-7 h-7 shrink-0">
            <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-semibold text-lg text-foreground" style={{ letterSpacing: "-0.02em" }}>
            Nzila
          </h2>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-all px-3 py-2.5 rounded-lg text-sm font-medium"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Nova Conversa
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-3">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`rounded-lg transition-all duration-150 ${
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/12"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                        <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 bg-border/40 mx-3" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-3 flex items-center gap-1.5">
            <History className="w-3 h-3" />
            Histórico
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-0.5">
              {conversations?.slice(0, 8).map((conv) => (
                <SidebarMenuItem key={conv.id}>
                  <SidebarMenuButton
                    asChild
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                  >
                    <button className="flex items-center gap-2.5 px-3 py-2 w-full text-left">
                      <ChevronRight className="w-3 h-3 shrink-0 opacity-40" />
                      <div className="min-w-0 flex-1">
                        <span className="truncate block text-xs font-medium">
                          {conv.title || "Conversa"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                          {format(new Date(conv.createdAt), "dd MMM")}
                        </span>
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {(!conversations || conversations.length === 0) && (
                <p className="px-3 py-2 text-xs text-muted-foreground/40">Nenhuma conversa</p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="p-3 border-t border-border/30">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">
                {user.firstName[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user.firstName}</p>
              <p className="text-[10px] text-muted-foreground/60 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Terminar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
