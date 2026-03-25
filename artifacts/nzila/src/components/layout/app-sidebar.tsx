import { BookOpen, MessageSquare, PenTool, BarChart2, PlusCircle, History } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListOpenaiConversations } from "@workspace/api-client-react";
import { useChatStore } from "@/hooks/use-chat-history";
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
} from "@/components/ui/sidebar";
import { format } from "date-fns";

const mainNav = [
  { title: "Chat", url: "/", icon: MessageSquare },
  { title: "Gírias", url: "/girias", icon: BookOpen },
  { title: "Contribuir", url: "/contribuir", icon: PenTool },
  { title: "Benchmark", url: "/benchmark", icon: BarChart2 },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { data: conversations } = useListOpenaiConversations();
  const { clearMessages } = useChatStore();

  const handleNewChat = () => {
    clearMessages();
    setLocation("/");
  };

  return (
    <Sidebar className="border-r border-border/50 bg-card">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-lg shadow-lg flex items-center justify-center">
            <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl tracking-tight text-foreground">Nzila</h2>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Assistente Angolano</p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 transition-all px-4 py-2.5 rounded-xl font-medium text-sm group"
        >
          <PlusCircle className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          Nova Conversa
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        transition-all duration-200 rounded-xl my-0.5
                        ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 py-5">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                        <span className="font-medium text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-border/50 mx-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <History className="w-3 h-3" />
            Histórico
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations?.slice(0, 8).map((conv) => (
                <SidebarMenuItem key={conv.id}>
                  <SidebarMenuButton asChild className="hover:bg-white/5 rounded-lg py-4 text-muted-foreground hover:text-foreground transition-colors">
                    <button onClick={() => {/* Will load history */}} className="flex flex-col items-start gap-1 w-full text-left">
                      <span className="truncate w-full font-medium text-sm">{conv.title || "Nova Conversa"}</span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {format(new Date(conv.createdAt), "dd MMM, HH:mm")}
                      </span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {(!conversations || conversations.length === 0) && (
                <div className="px-4 py-3 text-sm text-muted-foreground/50 text-center">
                  Nenhuma conversa ainda
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
