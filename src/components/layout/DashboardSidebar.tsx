import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Home, 
  PlusCircle, 
  Settings, 
  Users, 
  Video,
  Wallet,
  GraduationCap,
  ClipboardList
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
}

export const DashboardSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getSidebarItems = (): SidebarItem[] => {
    switch (user.role) {
      case 'student':
        return [
          { title: 'Dashboard', href: '/student/dashboard', icon: Home },
          { title: 'Browse Lectures', href: '/student/browse-lectures', icon: BookOpen },
          { title: 'My Lectures', href: '/student/my-lectures', icon: GraduationCap },
          { title: 'Wallet', href: '/student/wallet', icon: Wallet },
          { title: 'Buy UpCoins', href: '/student/buy-upcoins', icon: CreditCard },
        ];
      case 'trainer':
        return [
          { title: 'Dashboard', href: '/trainer/dashboard', icon: Home },
          { title: 'List Lecture', href: '/trainer/schedule-lecture', icon: PlusCircle },
          { title: 'Manage Lectures', href: '/trainer/manage-lectures', icon: Calendar },
          { title: 'Create Course', href: '/trainer/create-course', icon: BookOpen },
          { title: 'Manage Courses', href: '/trainer/manage-courses', icon: ClipboardList },
          { title: 'Students', href: '/trainer/students', icon: Users },
          { title: 'Earnings', href: '/trainer/earnings', icon: CreditCard },
        ];
      case 'admin':
        return [
          { title: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { title: 'Manage Users', href: '/admin/manage-users', icon: Users },
          { title: 'Manage Lectures', href: '/admin/manage-lectures', icon: BookOpen },
          { title: 'Manage Courses', href: '/admin/manage-courses', icon: ClipboardList },
          { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur">
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover-scale',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};