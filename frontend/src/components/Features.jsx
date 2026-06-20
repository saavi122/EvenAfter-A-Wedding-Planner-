import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiShield, FiClock, FiAlertCircle, FiCamera, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Features = () => {
  const services = [
    {
      title: "AI REVIEW",
      description: "Our AI scans, verifies, and analyzes vendor reviews to guarantee absolute authenticity and luxury quality.",
      image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=500&auto=format&fit=crop",
      icon: FiCpu,
    },
    {
      title: "ESCROW",
      description: "Secured escrow accounts hold milestone payments, releasing them only when design objectives are met.",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=500&auto=format&fit=crop",
      icon: FiShield,
    },
    {
      title: "TIMELINE",
      description: "Coordinators, vendors, and hosts share a live-updating event clock ensuring no details are missed.",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=500&auto=format&fit=crop",
      icon: FiClock,
    },
    {
      title: "CONFLICTS",
      description: "Built-in mediation channels offer transparent support and quick resolutions if booking schedules overlap.",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=500&auto=format&fit=crop",
      icon: FiAlertCircle,
    },
    {
      title: "MATCHMAKING",
      description: "Find and shortlist elite wedding planners, caterers, florists, and decorators suited to your theme.",
      isSolid: true, // Card 5 style matching reference image
      icon: FiCamera,
    },
    {
      title: "BUDGETING",
      description: "Real-time cost tracking logs expenses, payment schedules, and remaining balances in a dashboard.",
      image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=500&auto=format&fit=crop",
      icon: FiDollarSign,
    },
  ];

  return (
    <section id="features" className="py-24 bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl tracking-[0.15em] text-darktext dark:text-white uppercase font-light">
            Our Services
          </h2>
          <div className="w-12 h-[1px] bg-rosegold/50 mx-auto mt-4 dark:bg-goldAccent/45" />
        </div>

        {/* 3x2 Arch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center max-w-5xl mx-auto">
          {services.map((item, index) => {
            const Icon = item.icon;
            
            // Check if Card 5 (Solid media-style card)
            if (item.isSolid) {
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="w-full max-w-[280px] h-[380px] rounded-t-full border border-rosegold/30 dark:border-goldAccent/25 bg-cream/40 dark:bg-darkcard/40 flex flex-col items-center justify-between p-8 text-center shadow-md relative group select-none"
                >
                  <div className="mt-12 p-3 rounded-full border border-rosegold/20 dark:border-goldAccent/20 text-rosegold dark:text-goldAccent bg-white/60 dark:bg-black/30">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 flex flex-col justify-center mt-4">
                    <h3 className="font-playfair text-xl tracking-[0.15em] font-medium text-darktext dark:text-white">
                      {item.title}
                    </h3>
                    <p className="font-roboto text-xs mt-3 leading-relaxed opacity-75 font-light">
                      {item.description}
                    </p>
                  </div>

                  {/* Brown Rectangular CTA Button matching the reference image */}
                  <Link
                    to="/register"
                    className="mb-4 px-6 py-2 bg-rosegold/90 hover:bg-rosegold text-white dark:bg-goldAccent dark:hover:bg-goldAccent/90 dark:text-black font-semibold text-[10px] uppercase tracking-wider rounded transition-colors duration-300"
                  >
                    Read More
                  </Link>
                </motion.div>
              );
            }

            // Image-Arches (Cards 1, 2, 3, 4, 6)
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                className="w-full max-w-[280px] h-[380px] rounded-t-full border border-rosegold/25 hover:border-rosegold dark:border-goldAccent/20 dark:hover:border-goldAccent overflow-hidden relative shadow-md group select-none bg-black"
              >
                {/* Background Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.85] dark:brightness-[0.5]"
                />

                {/* Permanent Title Overlay (Overlaid at bottom center) */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent py-8 text-center z-10 transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="font-playfair text-lg tracking-[0.2em] text-white font-medium">
                    {item.title}
                  </h3>
                </div>

                {/* Hover Backdrop Overlay showing Description */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-center items-center p-6 text-center z-20 backdrop-blur-[2px]">
                  <div className="p-2.5 rounded-full border border-goldAccent/30 text-goldAccent mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-playfair text-base tracking-[0.15em] text-goldAccent font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="font-roboto text-xs leading-relaxed text-gray-300 font-light px-2">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Features;
