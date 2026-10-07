import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { SearchModal } from '../components/layout/SearchModal';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-30 lg:hidden shadow-2xl">
            <Sidebar onClose={closeMobileMenu} />
          </div>
        </>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950"
        >
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <SearchModal />
    </div>
  );
};
