import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Home, Plus, UserCog } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const menuItemsAdmin = [
  { title: 'Accueil Client', url: '/', icon: Home },
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Livraisons', url: '/admin/deliveries', icon: Package },
  { title: 'Création livraison', url: '/admin/deliveries/new', icon: Plus },
  { title: 'Nos livreur', url: '/admin/driver', icon: UserCog },
];

const menuItemsDriver = [
  { title: 'Accueil Client', url: '/', icon: Home },
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Livraisons', url: '/admin/driver/deliveries', icon: Package }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              { user.role === "admin" && menuItemsAdmin.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                          : 'hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state === 'expanded' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              { user.role === "driver" && menuItemsDriver.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                          : 'hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state === 'expanded' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
