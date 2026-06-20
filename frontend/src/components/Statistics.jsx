import React from 'react';
import { motion } from 'framer-motion';

const Statistics = () => {
  const stats = [
    { value: "1,200+", label: "Luxury Events Curation" },
    { value: "450+", label: "Accredited Artisans & Planners" },
    { value: "98.6%", label: "Client Satisfaction Score" },
    { value: "$5.4M", label: "Escrow Protections Transacted" },
  ];

  return (
    <section className="py-20 bg-cream/30 dark:bg-black/25 text-darktext dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center p-6 border border-rosegold/10 dark:border-goldAccent/10 rounded-lg bg-white/20 dark:bg-darkcard/20 backdrop-blur-sm"
            >
              <h3 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light text-rosegold dark:text-goldAccent tracking-wide">
                {stat.value}
              </h3>
              <p className="font-roboto text-xs md:text-sm tracking-widest text-darktext/70 dark:text-gray-400 mt-2 uppercase font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Statistics;
