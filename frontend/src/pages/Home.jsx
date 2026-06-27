import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Features from '../components/Features';
import Workflow from '../components/Workflow';
import Statistics from '../components/Statistics';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

// Concept 4: Delicate Script & Watercolor (Peach Blossoms on Ivory) Splash Screen
const SplashLoader = () => {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    // Generate 35 random petals for a dense windgust
    const newPetals = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      startY: 25 + Math.random() * 50, // percent height
      endY: 15 + Math.random() * 60,
      delay: Math.random() * 1.8, // delay in seconds
      duration: 3.8 + Math.random() * 1.4, // speed of petal flight
      size: 10 + Math.random() * 12,
      type: Math.random() > 0.55 ? 'pink' : 'white',
      scale: 0.85 + Math.random() * 0.4, // varying orbit radius multiplier
      rotation: Math.random() * 360,
      driftY: -40 + Math.random() * 80, // drift factor
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden">
      {/* Soft cream/marble gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FAF7F2] via-[#FCFAF6] to-[#F5EFE6] dark:from-[#1D1916] dark:via-[#221E1A] dark:to-[#171412]" />

      {/* Subtle luxury marble textures */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,150 C250,220 450,-50 650,320 C850,490 1050,120 1250,420" fill="none" stroke="#C9A27E" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M120,-30 C320,160 520,30 720,270 C920,380 1120,60 1320,320" fill="none" stroke="#C9A27E" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Petals swirling around */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className={`absolute splash-petal splash-petal-${petal.type}`}
            style={{
              width: `${petal.size}px`,
              height: `${petal.size * 0.75}px`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              '--start-y': `${petal.startY}vh`,
              '--end-y': `${petal.endY}vh`,
              '--scale': petal.scale,
              '--drift-y': `${petal.driftY}px`,
              '--start-rot': `${petal.rotation}deg`,
            }}
          />
        ))}
      </div>

      {/* Center Watercolor Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center justify-center"
      >
        {/* Luxury Gold/Watercolor Crest */}
        <div className="w-56 h-56 rounded-full flex items-center justify-center p-2 relative bg-gradient-to-tr from-[#FAF5F0] via-[#FCFBF9] to-[#F5EFE6] shadow-2xl border border-rosegold/10 dark:border-goldAccent/10">
          
          {/* Watercolor background effect */}
          <div className="absolute inset-2 rounded-full opacity-65 bg-gradient-to-b from-[#ffe5d9] via-[#ffccd5] to-transparent filter blur-md pointer-events-none" />

          {/* SVG Peach Blossoms / Gold Wreath Border */}
          <svg width="220" height="220" viewBox="0 0 200 200" className="absolute pointer-events-none">
            <defs>
              <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DFBA93" />
                <stop offset="50%" stopColor="#C9A27E" />
                <stop offset="100%" stopColor="#9E7854" />
              </linearGradient>
            </defs>

            {/* Concentric rings */}
            <path d="M 45 45 A 78 78 0 1 0 155 155" fill="none" stroke="url(#gold-grad)" strokeWidth="1.5" />
            <path d="M 155 155 A 78 78 0 0 0 45 45" fill="none" stroke="url(#gold-grad)" strokeWidth="1.5" className="opacity-25" />
            <path d="M 52 52 A 68 68 0 1 0 148 148" fill="none" stroke="url(#gold-grad)" strokeWidth="0.75" />

            {/* Wreath Top-Left */}
            <g transform="translate(100, 100)">
              <path d="M -55 -55 C -75 -35 -85 -10 -85 15" fill="none" stroke="url(#gold-grad)" strokeWidth="1.25" />
              
              {/* Leaves */}
              <g transform="translate(-55, -55) rotate(45) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0 C -10 10 -5 15 0 0" fill="url(#gold-grad)" />
              </g>
              <g transform="translate(-66, -44) rotate(30) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0" fill="url(#gold-grad)" />
              </g>
              <g transform="translate(-76, -28) rotate(15) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0" fill="url(#gold-grad)" />
              </g>
              <g transform="translate(-82, -10) rotate(0) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0" fill="url(#gold-grad)" />
              </g>
              <g transform="translate(-82, 8) rotate(-15) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0" fill="url(#gold-grad)" />
              </g>
              {/* Flower buds along the stem */}
              <g transform="translate(-48, -58) scale(0.4)">
                <circle cx="0" cy="0" r="5" fill="url(#gold-grad)" />
                <circle cx="-7" cy="0" r="4.5" fill="url(#gold-grad)" />
                <circle cx="7" cy="0" r="4.5" fill="url(#gold-grad)" />
                <circle cx="0" cy="-7" r="4.5" fill="url(#gold-grad)" />
                <circle cx="0" cy="7" r="4.5" fill="url(#gold-grad)" />
              </g>
            </g>

            {/* Wreath Bottom-Right */}
            <g transform="translate(100, 100)">
              <path d="M 55 55 C 75 35 85 10 85 -15" fill="none" stroke="url(#gold-grad)" strokeWidth="1.25" />
              
              {/* Leaves */}
              <g transform="translate(55, 55) rotate(225) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0 C -10 10 -5 15 0 0" fill="url(#gold-grad)" />
              </g>
              <g transform="translate(66, 44) rotate(210) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0" fill="url(#gold-grad)" />
              </g>
              <g transform="translate(76, 28) rotate(195) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0" fill="url(#gold-grad)" />
              </g>
              <g transform="translate(82, 10) rotate(180) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0" fill="url(#gold-grad)" />
              </g>
              <g transform="translate(82, -8) rotate(165) scale(0.7)">
                <path d="M0 0 C 10 -15 20 -10 0 0" fill="url(#gold-grad)" />
              </g>
              {/* Flower buds along the stem */}
              <g transform="translate(48, 58) scale(0.4)">
                <circle cx="0" cy="0" r="5" fill="url(#gold-grad)" />
                <circle cx="-7" cy="0" r="4.5" fill="url(#gold-grad)" />
                <circle cx="7" cy="0" r="4.5" fill="url(#gold-grad)" />
                <circle cx="0" cy="-7" r="4.5" fill="url(#gold-grad)" />
                <circle cx="0" cy="7" r="4.5" fill="url(#gold-grad)" />
              </g>
            </g>
          </svg>

          {/* Text Content */}
          <div className="text-center z-10 flex flex-col items-center justify-center pt-2">
            {/* Elegant Serif Initials "EA" */}
            <span className="font-playfair text-5xl font-bold tracking-tighter gold-text-grad leading-none select-none">
              EA
            </span>
            {/* Logo Name "EvenAfter" */}
            <span className="font-playfair text-xl font-bold tracking-normal text-[#A27C58] dark:text-[#DFBA93] mt-2 select-none">
              EvenAfter
            </span>
            {/* Subtext "Wedding Network" */}
            <span className="font-playfair text-[8px] uppercase tracking-[0.2em] text-[#A27C58]/80 dark:text-[#DFBA93]/80 mt-1 select-none font-semibold">
              Wedding Network
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Home = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show the splash screen on the first visit of the session
    return !sessionStorage.getItem('hasSeenSplash');
  });

  useEffect(() => {
    // Disable body scroll while splash screen is active
    if (showSplash) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash) return;

    // Show splash animation for 5.6 seconds, then fade out to landing page
    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('hasSeenSplash', 'true');
    }, 5600);
    return () => clearTimeout(timer);
  }, [showSplash]);

  return (
    <>
      {/* Import Great Vibes Google Font dynamically */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

        .font-greatvibes {
          font-family: 'Great Vibes', cursive;
        }

        .gold-text-grad {
          background: linear-gradient(135deg, #dfb893 0%, #c9a27e 50%, #9e7854 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes petal-orbit-wind {
          0% {
            transform: translate3d(-10vw, var(--start-y), 0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.9;
          }
          /* Approach the left edge of the logo circular boundary */
          25% {
            transform: translate3d(calc(50vw - (110px * var(--scale, 1))), calc(50vh + (var(--drift-y) * var(--scale, 1))), 0) rotate(120deg);
          }
          /* Orbit Around Logo (1.5 loops clockwise) */
          31% {
            transform: translate3d(calc(50vw - (77px * var(--scale, 1))), calc(50vh - (77px * var(--scale, 1))), 0) rotate(210deg);
          }
          37% {
            transform: translate3d(calc(50vw), calc(50vh - (110px * var(--scale, 1))), 0) rotate(300deg);
          }
          43% {
            transform: translate3d(calc(50vw + (77px * var(--scale, 1))), calc(50vh - (77px * var(--scale, 1))), 0) rotate(390deg);
          }
          49% {
            transform: translate3d(calc(50vw + (110px * var(--scale, 1))), calc(50vh), 0) rotate(480deg);
          }
          55% {
            transform: translate3d(calc(50vw + (77px * var(--scale, 1))), calc(50vh + (77px * var(--scale, 1))), 0) rotate(570deg);
          }
          61% {
            transform: translate3d(calc(50vw), calc(50vh + (110px * var(--scale, 1))), 0) rotate(660deg);
          }
          67% {
            transform: translate3d(calc(50vw - (77px * var(--scale, 1))), calc(50vh + (77px * var(--scale, 1))), 0) rotate(750deg);
          }
          73% {
            transform: translate3d(calc(50vw - (110px * var(--scale, 1))), calc(50vh), 0) rotate(840deg);
          }
          /* Swirling the top half again for elegant exit transition */
          79% {
            transform: translate3d(calc(50vw - (77px * var(--scale, 1))), calc(50vh - (77px * var(--scale, 1))), 0) rotate(930deg);
          }
          85% {
            transform: translate3d(calc(50vw), calc(50vh - (110px * var(--scale, 1))), 0) rotate(1020deg);
          }
          91% {
            transform: translate3d(calc(50vw + (77px * var(--scale, 1))), calc(50vh - (77px * var(--scale, 1))), 0) rotate(1110deg);
          }
          95% {
            transform: translate3d(calc(50vw + (110px * var(--scale, 1))), calc(50vh), 0) rotate(1180deg);
            opacity: 0.9;
          }
          /* Exit right edge (Fully visible!) */
          100% {
            transform: translate3d(110vw, var(--end-y), 0) rotate(1300deg);
            opacity: 0.9;
          }
        }

        .splash-petal {
          position: absolute;
          pointer-events: none;
          animation-name: petal-orbit-wind;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0;
          transform-style: preserve-3d;
        }

        .splash-petal-pink {
          background: radial-gradient(circle at 35% 35%, #fff5f5 0%, #ffccd5 60%, #ffb7b2 100%);
          border-radius: 50% 10% 50% 50%;
          box-shadow: 1px 1px 3px rgba(255, 183, 178, 0.3);
        }

        .splash-petal-white {
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #fff0f5 70%, #ffd1dc 100%);
          border-radius: 40% 10% 40% 40%;
          box-shadow: 1px 1px 3px rgba(220, 180, 180, 0.2);
        }
      `}} />

      <AnimatePresence>
        {showSplash && <SplashLoader />}
      </AnimatePresence>

      <div className="bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 font-roboto min-h-screen select-none overflow-x-hidden transition-colors duration-300">
        <Navbar />
        <Hero />
        <About />
        <Features />
        <Workflow />
        <Statistics />
        <Gallery />
        <Testimonials />
        <FAQ />
        <Contact />
        <Footer />
      </div>
    </>
  );
};

export default Home;
