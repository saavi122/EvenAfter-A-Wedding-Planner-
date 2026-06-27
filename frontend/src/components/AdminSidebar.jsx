import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiGrid, FiUsers, FiUser, FiLogOut, FiChevronLeft, FiChevronRight, FiMessageSquare, FiShield, FiFileText, FiList } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';

export const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Desktop collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Events', path: '/admin/events', icon: FiList },
  ];

  const sidebarVariants = {
    expanded: { width: 260, transition: { duration: 0.3, ease: 'easeInOut' } },
    collapsed: { width: 80, transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  const textVariants = {
    expanded: { opacity: 1, x: 0, display: 'block', transition: { delay: 0.1, duration: 0.2 } },
    collapsed: { opacity: 0, x: -10, transitionEnd: { display: 'none' }, transition: { duration: 0.1 } }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-ivory/95 dark:bg-darkbg/95 border-r border-rosegold/20 dark:border-goldAccent/15 text-darktext dark:text-gray-300 transition-colors duration-300">
      
      {/* Sidebar Header */}
      <div className={`flex items-center justify-between p-4 border-b border-rosegold/20 dark:border-goldAccent/15 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2.5"
          >
            <img src={logoImage} alt="EvenAfter Logo" className="w-8 h-8 rounded-lg object-cover shadow-md" />
            <span className="font-playfair font-black text-darktext dark:text-goldAccent flex items-center tracking-widest uppercase text-xs">
              EvenAfter
            </span>
          </motion.div>
        )}
        {isCollapsed && (
          <img src={logoImage} alt="EA" className="w-8 h-8 rounded-lg object-cover shadow-md" />
        )}
        
        {/* Toggle Button for desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-cream dark:hover:bg-darkcard text-rosegold dark:text-goldAccent transition-colors"
        >
          {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Profile summary in Sidebar */}
      {!isCollapsed && user && (
        <div className="p-4 border border-rosegold/20 dark:border-goldAccent/15 bg-cream/45 dark:bg-darkcard/40 m-3 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-rosegold text-white dark:bg-goldAccent dark:text-black flex items-center justify-center font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-darktext dark:text-white font-playfair">{user.name}</p>
              <p className="text-[10px] text-rosegold dark:text-goldAccent/80 font-semibold tracking-wider truncate uppercase">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 group relative ${
                isActive
                  ? 'bg-rosegold/10 text-rosegold dark:bg-goldAccent/10 dark:text-goldAccent border-l-4 border-rosegold dark:border-goldAccent'
                  : 'hover:bg-cream/40 dark:hover:bg-darkcard/40 text-darktext/80 dark:text-gray-400 hover:text-rosegold dark:hover:text-goldAccent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0 text-rosegold dark:text-goldAccent/80 group-hover:scale-110 transition-transform duration-350" />
            <motion.span
              variants={textVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="whitespace-nowrap font-playfair font-semibold"
            >
              {item.name}
            </motion.span>
            
            {/* Tooltip on collapsed state */}
            {isCollapsed && (
              <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all rounded-md bg-darkcard border border-rosegold/30 text-darktext dark:text-goldAccent text-xs px-2.5 py-1.5 z-50 whitespace-nowrap shadow-md pointer-events-none">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-rosegold/20 dark:border-goldAccent/15">
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3 w-full px-3 py-3 rounded-xl text-sm font-medium hover:bg-rosegold/10 hover:text-rosegold dark:hover:bg-goldAccent/10 dark:hover:text-goldAccent text-darktext/70 dark:text-gray-400 transition-all group relative ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0 text-rosegold dark:text-goldAccent/80" />
          <motion.span
            variants={textVariants}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            className="whitespace-nowrap font-playfair font-semibold"
          >
            Logout
          </motion.span>

          {isCollapsed && (
            <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all rounded-md bg-darkcard border border-rosegold/35 text-rosegold text-xs px-2.5 py-1.5 z-50 whitespace-nowrap shadow-md pointer-events-none">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className="hidden md:block fixed top-0 left-0 h-screen z-40 overflow-hidden shadow-sm"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[260px] z-50 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
