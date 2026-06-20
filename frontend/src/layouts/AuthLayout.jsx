import React from "react";
import { Link } from "react-router-dom";
import FlowerOverlay from "../components/FlowerOverlay";
import ThemeToggle from "../components/ThemeToggle";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 font-roboto flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Image with Soft Gradient Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920&auto=format&fit=crop"
          alt="Luxury Wedding Couple"
          className="w-full h-full object-cover object-center filter brightness-[0.7] dark:brightness-[0.25] transition-all duration-300"
        />
        {/* Soft layout overlay */}
        <div className="absolute inset-0 bg-ivory/85 dark:bg-darkbg/90 backdrop-blur-[3px] transition-colors duration-300" />
      </div>

      {/* Flower sway garlands and falling petals */}
      <FlowerOverlay />

      {/* Top Header bar with Theme Toggle */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-lg z-25 transition-all duration-500 ease-in-out">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link
            to="/"
            className="font-playfair text-3xl md:text-4xl font-bold tracking-widest text-darktext dark:text-goldAccent hover:opacity-90 transition-opacity duration-300"
          >
            EvenAfter
          </Link>
          <p className="text-darktext/75 dark:text-gray-400 mt-2 text-xs md:text-sm font-light tracking-wider uppercase">
            Luxury Event Curation & Management
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-white/95 dark:bg-darkcard/95 border border-rosegold/25 dark:border-goldAccent/25 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] p-6 md:p-10 relative overflow-hidden transition-all duration-300">
          {/* Card top decorative accent line */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-rosegold dark:via-goldAccent to-transparent"></div>

          {title && (
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-light font-playfair text-darktext dark:text-white tracking-wide">
                {title}
              </h2>
              {subtitle && (
                <p className="text-darktext/60 dark:text-gray-400 text-xs md:text-sm mt-1.5 font-light">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] uppercase tracking-[0.15em] text-darktext/50 dark:text-gray-500 mt-6 select-none font-medium">
          © {new Date().getFullYear()} EvenAfter. All rights reserved. Curation Portal.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
