import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ClientSidebar from '../components/ClientSidebar';
import ThemeToggle from '../components/ThemeToggle';
import AIWeddingPlanner from '../components/AIWeddingPlanner';

export const ClientLayout = () => {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [padLeft, setPadLeft] = useState('md:pl-[260px]');
  const location = useLocation();

  // Watch local storage state for sidebar collapse to dynamically adjust layout padding
  useEffect(() => {
    const checkCollapse = () => {
      const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      setPadLeft(isCollapsed ? 'md:pl-[80px]' : 'md:pl-[260px]');
    };

    // Initial check
    checkCollapse();

    // Check periodically or via custom event if needed
    const interval = setInterval(checkCollapse, 150);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory dark:bg-darkbg transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-rosegold/30 border-t-rosegold dark:border-goldAccent/30 dark:border-t-goldAccent rounded-full animate-spin"></div>
          <p className="font-playfair text-xs tracking-widest text-darktext/60 dark:text-gray-400 uppercase animate-pulse">
            Loading Client Suite...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if user not authenticated or not client
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-ivory dark:bg-darkbg text-darktext dark:text-gray-305 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <ClientSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${padLeft}`}>
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-ivory/80 dark:bg-darkbg/85 backdrop-blur-md border-b border-rosegold/20 dark:border-goldAccent/15">
          <div className="flex items-center space-x-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-cream dark:hover:bg-darkcard text-rosegold dark:text-goldAccent transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            
            {/* Page title */}
            <div>
              <h1 className="text-lg font-bold capitalize text-darktext dark:text-goldAccent font-playfair tracking-wide">
                {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="h-8 w-px bg-rosegold/20 dark:bg-goldAccent/25 hidden sm:block" />
            <div className="hidden sm:flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-rosegold text-white dark:bg-goldAccent dark:text-black font-bold text-sm flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-darktext dark:text-white font-playfair">
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
      <AIWeddingPlanner />
    </div>
  );
};
export default ClientLayout;
