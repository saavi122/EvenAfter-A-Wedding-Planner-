import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-16 bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Delicate Floral Branch Divider */}
        <div className="flex justify-center mb-10 text-rosegold/50 dark:text-goldAccent/40">
          <svg className="w-24 h-16" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Elegant horizontal branch stems and leaves */}
            <path d="M10,20 C35,20 40,20 90,20" strokeDasharray="2 2" />
            
            {/* Center bloom flourish */}
            <path d="M50,10 C46,4 40,8 50,18 C60,8 54,4 50,10 Z" fill="currentColor" opacity="0.8" />
            
            {/* Small leaves branching off */}
            <path d="M30,20 C25,12 20,15 30,20 C35,12 38,15 30,20 Z" fill="currentColor" opacity="0.3" />
            <path d="M70,20 C65,12 60,15 70,20 C75,12 78,15 70,20 Z" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        {/* Large Editorial Headline */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-light italic tracking-wider text-darktext/90 dark:text-white leading-relaxed uppercase">
            Dedicated to <span className="font-bold not-italic text-rosegold dark:text-goldAccent">crafting</span> extraordinary weddings, <br />
            we bring years of expertise and a <span className="font-bold not-italic text-rosegold dark:text-goldAccent">portfolio</span> filled <br />
            with <span className="font-bold not-italic text-rosegold dark:text-goldAccent">unforgettable</span> moments.
          </h2>
        </div>

        {/* Two-Column Story with Signature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto mb-20 text-sm font-light leading-relaxed text-darktext/80 dark:text-gray-400">
          <div className="space-y-4">
            <p>
              Here, we understand that your wedding day is a chapter in your love story, and we're here to ensure it's told beautifully. With years of experience in orchestrating dream celebrations, we have earned a reputation for creating unforgettable memories.
            </p>
          </div>
          <div className="space-y-4 flex flex-col justify-between items-start">
            <p>
              Our journey is woven with a passion for fine design, meticulous planning, and secure transaction systems. We are not visual event planners; we are professional curators dedicated to making your milestone day a true reflection of your vision.
            </p>
            <div className="pt-4 flex flex-col">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-rosegold/80 dark:text-goldAccent/80">With Love,</span>
              {/* Cursive style branding signature */}
              <span className="font-playfair italic text-2xl text-rosegold dark:text-goldAccent mt-1 font-bold">
                EvenAfter
              </span>
            </div>
          </div>
        </div>

        {/* Editorial Photo Collage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto items-center">
          
          {/* Collage Item 1: Portrait left (e.g. Model in red gown) */}
          <div className="md:col-span-4 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-64 h-80 rounded overflow-hidden shadow-md border border-rosegold/10 dark:border-goldAccent/10"
            >
              <img
                src="https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=500&auto=format&fit=crop"
                alt="Editorial Portrait Gown"
                className="w-full h-full object-cover filter brightness-[0.95] dark:brightness-90"
              />
            </motion.div>
          </div>

          {/* Collage Item 2: Central Circular Monogram Emblem */}
          <div className="md:col-span-3 flex flex-col items-center justify-center py-6 md:py-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="w-28 h-28 rounded-full border border-dashed border-rosegold/40 dark:border-goldAccent/30 flex items-center justify-center relative p-2"
            >
              {/* Monogram Outer Rotating Text circle effect */}
              <div className="absolute inset-0 border border-rosegold/20 dark:border-goldAccent/15 rounded-full animate-spin-slow" />
              <div className="text-center font-playfair text-xl tracking-widest text-rosegold dark:text-goldAccent font-bold">
                EA
              </div>
            </motion.div>
            <span className="text-[9px] tracking-[0.2em] uppercase text-rosegold/70 dark:text-goldAccent/60 mt-4 font-semibold">
              Signature Curation
            </span>
          </div>

          {/* Collage Item 3: Landscape right (Bride in white dress) */}
          <div className="md:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="w-full max-w-[420px] h-64 rounded overflow-hidden shadow-md border border-rosegold/10 dark:border-goldAccent/10"
            >
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=700&auto=format&fit=crop"
                alt="Luxury Reception Setup"
                className="w-full h-full object-cover filter brightness-[0.95] dark:brightness-90"
              />
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default About;
