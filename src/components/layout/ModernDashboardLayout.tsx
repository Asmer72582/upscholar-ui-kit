import React from 'react';
import { Outlet } from 'react-router-dom';
import { ModernHeader } from './ModernHeader';
import { ModernSidebar } from './ModernSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export const ModernDashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-secondary">
        <ModernSidebar />
        <SidebarInset className="flex-1">
          <ModernHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};