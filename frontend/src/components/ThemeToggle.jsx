import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full border border-rosegold/30 hover:border-rosegold text-rosegold transition-all duration-300 focus:outline-none dark:border-goldAccent/30 dark:hover:border-goldAccent dark:text-goldAccent bg-white/40 dark:bg-black/40 backdrop-blur-md shadow-sm hover:scale-105"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <FiMoon className="w-5 h-5 animate-pulse" />
      ) : (
        <FiSun className="w-5 h-5 animate-spin-slow" />
      )}
    </button>
  );
};

export default ThemeToggle;
