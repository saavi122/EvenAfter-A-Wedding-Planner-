import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiGrid, FiUsers, FiUser, FiLogOut, FiChevronLeft, FiChevronRight, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export const ClientSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Desktop collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/client/dashboard', icon: FiGrid },
    { name: 'Find Planners', path: '/client/planners', icon: FiUsers },
    { name: 'Direct Chat', path: '/client/chat/list', icon: FiMessageSquare },
    { name: 'My Profile', path: '/client/profile', icon: FiUser },
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
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] border-r border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Sidebar Header */}
      <div className={`flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-800/50 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
              EA
            </div>
            <span className="font-playfair font-black text-stone-900 dark:text-white flex items-center">
              Even<span className="font-alex text-rose-500 text-xl font-normal ml-0.5 mt-0.5">After</span>
            </span>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
            E
          </div>
        )}
        
        {/* Toggle Button for desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Profile summary in Sidebar */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 m-3 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.name === 'Direct Chat' && user ? `/client/chat/list` : item.path}
            end={item.path === '/client/dashboard'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-accent/10 to-primary/10 text-accent border-l-4 border-accent'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <motion.span
              variants={textVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="whitespace-nowrap"
            >
              {item.name}
            </motion.span>
            
            {/* Tooltip on collapsed state */}
            {isCollapsed && (
              <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all rounded-md bg-slate-950 text-white text-xs px-2.5 py-1.5 z-50 whitespace-nowrap shadow-md pointer-events-none">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3 w-full px-3 py-3 rounded-xl text-sm font-semibold hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 dark:text-slate-400 transition-all group relative ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          <motion.span
            variants={textVariants}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            className="whitespace-nowrap"
          >
            Logout
          </motion.span>

          {isCollapsed && (
            <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all rounded-md bg-rose-600 text-white text-xs px-2.5 py-1.5 z-50 whitespace-nowrap shadow-md pointer-events-none">
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
export default ClientSidebar;
