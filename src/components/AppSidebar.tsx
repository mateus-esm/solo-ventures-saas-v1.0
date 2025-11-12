import { Home, MessageCircle, LayoutDashboard, HelpCircle, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/solo-ventures-logo.png";
import icon from "@/assets/solo-ventures-icon.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Início", url: "/home", icon: Home },
  { title: "Chat AdvAI", url: "/chat", icon: MessageCircle },
  { title: "CRM", url: "/crm", icon: LayoutDashboard },
  { title: "Suporte", url: "/suporte", icon: HelpCircle },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const currentPath = location.pathname;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <img src={icon} alt="Solo Ventures" className="h-8 w-8 shrink-0" />
          {open && (
            <img src={logo} alt="Solo Ventures" className="h-6" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {open && profile && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-foreground truncate">
              {profile.nome_completo}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile.email}
            </p>
          </div>
        )}
        <SidebarMenuButton onClick={handleSignOut} className="w-full">
          <LogOut className="h-5 w-5 shrink-0" />
          {open && <span>Sair</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
