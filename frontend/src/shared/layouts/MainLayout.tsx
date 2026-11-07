import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoomiHeader } from '@/shared/components/RoomiHeader';
import { Footer } from '@/shared/components/Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stay-bg-app text-stay-text transition-colors duration-200">
      {/* Roomi Header */}
      <RoomiHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
