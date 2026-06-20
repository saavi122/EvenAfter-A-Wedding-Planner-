import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const reviews = [
    {
      quote: "VendorNest took our vision and transformed it into a secure, perfectly timed reality. We managed payments through escrow and collaborated with our dream florist in real time.",
      author: "Evelyn & Thomas",
      role: "Bridal Couple",
    },
    {
      quote: "As a planner, keeping all vendors, clients, and timelines synchronized is paramount. VendorNest has completely shifted how we coordinate details on the wedding day.",
      author: "Aria Sterling",
      role: "Lead Event Designer",
    },
    {
      quote: "The secure escrow payouts gave us complete confidence, and the AI review analyzer helps highlight our verified custom-made cake portfolios.",
      author: "Marcus Voisin",
      role: "Fine Art Caterer",
    },
  ];

  return (
    <section className="py-24 bg-cream/40 dark:bg-black/40 text-darktext dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-20">
          <span className="text-xs font-semibold tracking-[0.2em] text-rosegold dark:text-goldAccent uppercase">Magazine Acclaim</span>
          <h2 className="font-playfair text-3xl md:text-5xl font-light mt-2 tracking-wide text-darktext dark:text-white">
            Shared Experiences
          </h2>
          <div className="w-12 h-[1px] bg-rosegold mx-auto mt-4 dark:bg-goldAccent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {reviews.map((rev, index) => (
            <motion.div
              key={rev.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="relative flex flex-col justify-between p-8 border border-rosegold/15 bg-white/40 dark:border-goldAccent/10 dark:bg-darkcard/30 rounded-lg shadow-sm backdrop-blur-sm"
            >
              {/* Giant quote mark decoration */}
              <span className="font-playfair italic text-7xl text-rosegold/10 dark:text-goldAccent/5 absolute top-2 left-4 select-none">
                “
              </span>

              <p className="font-playfair italic text-base leading-relaxed tracking-wide text-darktext/90 dark:text-gray-200 relative z-10">
                {rev.quote}
              </p>

              <div className="mt-8 pt-4 border-t border-rosegold/10 dark:border-goldAccent/10 flex flex-col">
                <span className="font-playfair text-sm font-semibold text-rosegold dark:text-goldAccent uppercase tracking-widest">
                  {rev.author}
                </span>
                <span className="text-xs text-darktext/60 dark:text-gray-400 mt-1 uppercase font-light tracking-wide">
                  {rev.role}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
