import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import VendorSidebar from '../components/VendorSidebar';
import ThemeToggle from '../components/ThemeToggle';

export const VendorLayout = () => {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [padLeft, setPadLeft] = useState('md:pl-[260px]');
  const location = useLocation();

  useEffect(() => {
    const checkCollapse = () => {
      const isCollapsed = localStorage.getItem('vendor-sidebar-collapsed') === 'true';
      setPadLeft(isCollapsed ? 'md:pl-[80px]' : 'md:pl-[260px]');
    };

    checkCollapse();
    const interval = setInterval(checkCollapse, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-accent/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-accent animate-spin" />
          </div>
          <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase animate-pulse">
            Loading Vendor Suite...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <VendorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${padLeft}`}>
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            
            <div>
              <h1 className="text-lg font-bold capitalize text-slate-900 dark:text-white">
                {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="hidden sm:flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold text-sm flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user.name}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
