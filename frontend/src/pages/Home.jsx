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
import logoImage from '../assets/logo.png';
import marbleBg from '../assets/marble_bg.jpg';

// Premium animated luxury loading screen
const SplashLoader = () => {
  const [petals, setPetals] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Generate 45 rose petals starting from left-top side traveling diagonally to right-bottom
    const newPetals = Array.from({ length: 45 }).map((_, i) => {
      const scale = 0.65 + Math.random() * 0.55;
      return {
        id: i,
        startX: -30 + Math.random() * 25, // top-left starting position
        startY: -20 + Math.random() * 25, // top-left starting position
        delay: Math.random() * 3.8, // staggered delay in seconds for continuous stream
        duration: 5.2 + Math.random() * 2.4, // float time
        size: 9 + Math.random() * 13,
        type: Math.random() > 0.65 ? 'rose' : 'pink',
        scale,
        rotation: Math.random() * 360,
        driftY: 20 + Math.random() * 70, // drift factor
      };
    });
    setPetals(newPetals);

    // Generate 20 glowing sparkles around the circle
    const newSparkles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      angle: (i * 360) / 20,
      delay: Math.random() * 2,
      scale: 0.5 + Math.random() * 0.8
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        filter: "blur(12px)",
        transition: { duration: 0.9, ease: "easeInOut" }
      }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#FAF7F2]"
    >
      {/* Luxury White Marble Parallax Background (Scene 1) */}
      <motion.div
        animate={{ 
          scale: [1, 1.04],
          x: [0, -8, 0],
          y: [0, -4, 0]
        }}
        transition={{ 
          duration: 9, 
          ease: "linear",
          repeat: Infinity
        }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${marbleBg})`
        }}
      />
      {/* Soft champagne gradient overlay to keep it luxury and light */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FAF7F2]/80 via-[#FCFAF6]/70 to-[#F5EFE6]/80 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />

      {/* Floating Sparkles around Wreath (Scene 4) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {sparkles.map((sp) => {
          const radius = 95; // radius of gold ring
          const rad = (sp.angle * Math.PI) / 180;
          const x = 50 + (radius / 10) * Math.cos(rad); // percent left
          const y = 50 + (radius / 10) * Math.sin(rad); // percent top
          return (
            <motion.div
              key={`sparkle-${sp.id}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0], 
                scale: [0.3, sp.scale, 0.3],
                x: [`calc(${x}vw - 2px)`, `calc(${x}vw + ${Math.random() * 10 - 5}px)`],
                y: [`calc(${y}vh - 2px)`, `calc(${y}vh + ${Math.random() * 10 - 5}px)`]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: sp.delay + 1.5, // starts showing after logo starts revealing
                ease: "easeInOut"
              }}
              className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-rosegold via-[#D8C3A5] to-rosegold shadow-[0_0_6px_rgba(201,162,126,0.9)]"
            />
          );
        })}
      </div>

      {/* Floating Petals Swirling (Scene 2, 4, 5) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="petal-container"
            style={{
              width: `${petal.size}px`,
              height: `${petal.size * 0.78}px`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              '--start-x': `${petal.startX}vw`,
              '--start-y': `${petal.startY}vh`,
              '--drift-y': `${petal.driftY}px`,
            }}
          >
            <div
              className={`splash-petal splash-petal-${petal.type}`}
              style={{
                animationDelay: `${petal.delay * 0.3}s`,
                animationDuration: `${2.6 + petal.scale * 1.6}s`,
                '--scale': petal.scale,
                '--start-rot': `${petal.rotation}deg`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Center Logo Crest (Scene 3 & 4) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 1.4, ease: "easeOut" }}
        className="relative z-30 flex flex-col items-center justify-center"
      >
        {/* Luxury Gold Monogram Emblem */}
        <div className="w-56 h-56 rounded-full flex items-center justify-center p-2 relative bg-white/20 backdrop-blur-sm border border-rosegold/10 shadow-[0_10px_35px_rgba(201,162,126,0.1)]">
          {/* Subtle gold ring wreath shadow */}
          <div className="absolute inset-3 rounded-full border border-dashed border-rosegold/10 animate-[spin_50s_linear_infinite]" />
          
          <div className="text-center z-10 flex flex-col items-center justify-center">
            {/* Elegant Website Logo Image */}
            <img 
              src={logoImage} 
              alt="EvenAfter Logo" 
              className="w-14 h-14 rounded-xl object-cover shadow-md mb-3 border border-rosegold/10 transition-transform hover:scale-105 duration-500" 
            />

            {/* Serif Name */}
            <span className="font-playfair text-2xl font-bold tracking-wider bg-gradient-to-r from-[#DFBA93] via-[#C9A27E] to-[#9E7854] bg-clip-text text-transparent select-none leading-none font-semibold">
              EvenAfter
            </span>
            {/* Tagline */}
            <span className="font-roboto text-[7px] uppercase tracking-[0.25em] text-[#9E7854]/85 mt-2 select-none font-extrabold">
              Where Every Celebration Begins Beautifully
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
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

        @keyframes petal-diagonal-path {
          0% {
            transform: translate3d(var(--start-x), var(--start-y), 0);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
          }
          90% {
            opacity: 0.95;
          }
          100% {
            transform: translate3d(calc(var(--start-x) + 125vw), calc(var(--start-y) + 105vh + var(--drift-y)), 0);
            opacity: 0;
          }
        }

        @keyframes petal-sway-wave {
          0% {
            transform: rotate(var(--start-rot)) translateX(-20px) scale(0.5);
          }
          50% {
            transform: rotate(calc(var(--start-rot) + 180deg)) translateX(20px) scale(var(--scale));
          }
          100% {
            transform: rotate(calc(var(--start-rot) + 360deg)) translateX(-20px) scale(0.5);
          }
        }

        .petal-container {
          position: absolute;
          pointer-events: none;
          animation-name: petal-diagonal-path;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.35, 0.1, 0.25, 1);
          opacity: 0;
        }

        .splash-petal {
          width: 100%;
          height: 100%;
          animation-name: petal-sway-wave;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-timing-function: ease-in-out;
          transform-style: preserve-3d;
        }

        .splash-petal-rose {
          background: radial-gradient(circle at 35% 35%, #fff0f5 0%, #ffa5b8 50%, #f47a95 100%);
          border-radius: 50% 15% 55% 50%;
          box-shadow: 1px 1px 4px rgba(244, 122, 149, 0.25);
        }

        .splash-petal-pink {
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #ffccd5 60%, #ffa3b1 100%);
          border-radius: 40% 12% 42% 40%;
          box-shadow: 1px 1px 4px rgba(255, 163, 177, 0.2);
        }
      `}} />

      <AnimatePresence>
        {showSplash && <SplashLoader />}
      </AnimatePresence>

      <motion.div 
        initial={{ filter: "blur(12px)", opacity: 0.8 }}
        animate={!showSplash ? { filter: "blur(0px)", opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 font-roboto min-h-screen select-none overflow-x-hidden transition-colors duration-300"
      >
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
      </motion.div>
    </>
  );
};

export default Home;
