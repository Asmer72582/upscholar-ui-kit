import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/adminService';
import { 
  BarChart3, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Home, 
  PlusCircle, 
  Settings, 
  Users, 
  Wallet,
  GraduationCap,
  ClipboardList,
  ChevronRight,
  LogOut,
  HelpCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { LucideIcon } from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export const ModernSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending trainers count for admin
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchPendingCount = async () => {
        try {
          const stats = await adminService.getUserStats();
          setPendingCount(stats.pending || 0);
        } catch (error) {
          console.error('Error fetching pending count:', error);
        }
      };
      
      fetchPendingCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return null;

  const getSidebarItems = (): SidebarItem[] => {
    switch (user.role) {
      case 'student':
        return [
          { title: 'Dashboard', href: '/student/dashboard', icon: Home },
          { title: 'Browse Lectures', href: '/student/browse-lectures', icon: BookOpen },
          { title: 'My Lectures', href: '/student/my-lectures', icon: GraduationCap },
          { title: 'Request & Bidding', href: '/student/bidding', icon: ClipboardList },
          { title: 'Wallet', href: '/student/wallet', icon: Wallet },
          { title: 'Buy UpCoins', href: '/student/buy-upcoins', icon: CreditCard },
          { title: 'Support', href: '/student/support', icon: HelpCircle },
          { title: 'Settings', href: '/student/settings', icon: Settings },
        ];
      case 'trainer':
        return [
          { title: 'Dashboard', href: '/trainer/dashboard', icon: Home },
          { title: 'List Lecture', href: '/trainer/schedule-lecture', icon: PlusCircle },
          { title: 'Manage Lectures', href: '/trainer/manage-lectures', icon: Calendar },
          { title: 'Request & Bidding', href: '/trainer/bidding', icon: ClipboardList },
          { title: 'Students', href: '/trainer/students', icon: Users },
          { title: 'Wallet & Earnings', href: '/trainer/wallet', icon: Wallet },
          { title: 'Support', href: '/trainer/support', icon: HelpCircle },
          { title: 'Settings', href: '/trainer/settings', icon: Settings },
        ];
      case 'admin':
        return [
          { title: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { title: 'Manage Users', href: '/admin/manage-users', icon: Users, badge: pendingCount },
          { title: 'Manage Lectures', href: '/admin/manage-lectures', icon: BookOpen },
          { title: 'Withdrawal Requests', href: '/admin/withdrawals', icon: Wallet },
          { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
          { title: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r-0 bg-gradient-sidebar shadow-modern">
      <SidebarHeader className="border-b border-sidebar-border/20 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10  rounded-xl flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="Upscholar Logo" className="w-10 h-10 text-white object-contain" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">Upscholar</h2>
              <p className="text-sm text-sidebar-foreground/70 capitalize">{user.role} Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold mb-4 px-2">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'w-full justify-start rounded-xl transition-all duration-200 group',
                      'hover:bg-sidebar-accent hover:shadow-soft',
                      isActive(item.href)
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-soft'
                        : 'text-sidebar-foreground hover:text-sidebar-foreground'
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-3 px-3 py-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="font-medium">{item.title}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="ml-auto mr-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                          <ChevronRight className={cn(
                            "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                            !item.badge && "ml-auto"
                          )} />
                        </>
                      )}
                      {collapsed && item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge > 9 ? '9' : item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/20 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 border-2 border-sidebar-border/30">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
              {user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName ? `${user.firstName} ${user.lastName}` : user.email.split('@')[0]}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};