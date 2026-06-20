import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import logoImage from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const handleScrollTo = (id) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', id: 'home', to: '/' },
    { label: 'Features', id: 'features', to: '/#features' },
    { label: 'About', id: 'about', to: '/#about' },
    { label: 'Contact', id: 'contact', to: '/#contact' },
  ];

  // Determine navbar background styles
  const isTransparent = isHome && !isScrolled;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isTransparent
        ? 'bg-transparent border-b border-transparent py-2'
        : 'bg-ivory/90 dark:bg-darkbg/90 backdrop-blur-md border-b border-rosegold/10 dark:border-goldAccent/10 py-0 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo on Left */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-2.5 group"
            >
              <img src={logoImage} alt="EvenAfter Logo" className="w-9 h-9 rounded-lg object-cover shadow-md transition-transform group-hover:scale-105" />
              <span className={`font-playfair text-xl md:text-2xl font-bold tracking-widest transition-colors duration-500 ${
                isTransparent ? 'text-white drop-shadow-md' : 'text-darktext dark:text-goldAccent'
              }`}>
                EvenAfter
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleScrollTo(link.id)}
                className={`text-sm font-medium tracking-wider uppercase transition-colors duration-500 ${
                  isTransparent
                    ? 'text-white/95 hover:text-champagne drop-shadow-sm'
                    : 'text-darktext/80 dark:text-gray-300 hover:text-rosegold dark:hover:text-goldAccent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action CTAs + Toggle */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <ThemeToggle />

            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className={`px-3 py-1.5 md:px-5 md:py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-300 ${
                  isTransparent
                    ? 'text-white border border-white/60 hover:bg-white/10'
                    : 'text-darktext border border-rosegold hover:bg-cream/40 dark:text-goldAccent dark:border-goldAccent dark:hover:bg-goldAccent/10'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 md:px-5 md:py-2 text-xs font-semibold uppercase tracking-wider text-white bg-rosegold hover:bg-rosegold/90 dark:text-black dark:bg-goldAccent dark:hover:bg-goldAccent/90 rounded shadow-sm hover:shadow-md transition-all duration-300"
              >
                Register
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-md transition-colors duration-500 focus:outline-none ${
                isTransparent ? 'text-white hover:bg-white/10' : 'text-darktext dark:text-goldAccent hover:bg-cream/20'
              }`}
              aria-label="Toggle Menu"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-ivory dark:bg-darkbg border-b border-rosegold/10 dark:border-goldAccent/10 py-4 transition-colors duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleScrollTo(link.id)}
                className="block w-full text-center px-3 py-3 text-sm font-medium tracking-wider text-darktext/80 dark:text-gray-300 hover:text-rosegold dark:hover:text-goldAccent transition-colors uppercase border-b border-rosegold/5 last:border-b-0"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
