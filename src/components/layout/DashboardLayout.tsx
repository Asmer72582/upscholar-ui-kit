import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { DashboardSidebar } from './DashboardSidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};