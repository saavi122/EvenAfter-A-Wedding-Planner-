import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FlowerOverlay from './FlowerOverlay';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ivory dark:bg-darkbg pt-20">
      
      {/* Background Image with Soft Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920&auto=format&fit=crop"
          alt="Luxury Wedding Couple"
          className="w-full h-full object-cover object-center filter brightness-[0.75] dark:brightness-[0.35]"
        />
        {/* Editorial overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Flower sway garlands and falling petals */}
      <FlowerOverlay />

      {/* Curved Arch Bottom Edge (Convex dipping scoop) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
        <svg className="relative block w-full h-[60px] md:h-[110px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0 C600,120 600,120 1200,0 L1200,120 L0,120 Z"
            className="fill-ivory dark:fill-darkbg transition-colors duration-300"
          />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-25 max-w-5xl mx-auto px-4 text-center select-none pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Tagline / Subtitle */}
          <span className="inline-block text-xs md:text-sm font-semibold tracking-[0.3em] text-white/95 uppercase drop-shadow-md">
            Crafting Unforgettable Celebrations
          </span>

          {/* Premium Headline */}
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-light tracking-wide text-white leading-tight drop-shadow-lg">
            Turning Your Wedding Dreams <br />
            <span className="font-playfair italic text-champagne">Into Ultimate Reality</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/90 font-light leading-relaxed tracking-wide drop-shadow">
            One platform connecting clients, planners, vendors and coordinators. Experience luxury event curation designed to capture every details.
          </p>

          {/* CTA Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-3.5 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-darktext bg-white hover:bg-cream hover:text-darktext rounded shadow-lg transition-all duration-300 hover:scale-[1.03]"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-10 py-3.5 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-white border border-white/65 hover:bg-white/10 rounded backdrop-blur-sm transition-all duration-300 hover:scale-[1.03]"
            >
              Portal Login
            </Link>
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default Hero;
