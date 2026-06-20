import React from 'react';
import { motion } from 'framer-motion';

const Workflow = () => {
  const steps = [
    {
      step: "01",
      title: "Discover & Design",
      description: "Browse high-end wedding portfolios, filter by aesthetic theme, and directly contact accredited planners and artisans.",
    },
    {
      step: "02",
      title: "Collaborate & Outline",
      description: "Define service details, create checklist timelines, and draft smart escrow contracts defining milestone releases.",
    },
    {
      step: "03",
      title: "Secure Deposits",
      description: "Fund event agreements through our secure payment gateway. Funds remain in escrow protecting your investment.",
    },
    {
      step: "04",
      title: "Seamless Coordination",
      description: "Cooperate using our live synchronized task timeline, managing vendor schedules, deliveries, and table layouts.",
    },
    {
      step: "05",
      title: "Celebrate & Release",
      description: "Enjoy your dream event. Confirm task completions to release escrow payouts, then post verified reviews.",
    },
  ];

  return (
    <section className="py-24 bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-20">
          <span className="text-xs font-semibold tracking-[0.2em] text-rosegold dark:text-goldAccent uppercase">The Journey</span>
          <h2 className="font-playfair text-3xl md:text-5xl font-light mt-2 tracking-wide text-darktext dark:text-white">
            How VendorNest Works
          </h2>
          <div className="w-12 h-[1px] bg-rosegold mx-auto mt-4 dark:bg-goldAccent" />
        </div>

        {/* Timeline Layout */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Center Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 h-full w-[1px] bg-rosegold/30 dark:bg-goldAccent/25 -translate-x-[0.5px] hidden sm:block" />

          <div className="space-y-16">
            {steps.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={`flex flex-col sm:flex-row items-stretch ${
                    isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  {/* Left/Right Text Side */}
                  <div className="w-full sm:w-1/2 px-4 sm:px-12 flex flex-col justify-center text-left sm:text-right">
                    <div className={isEven ? 'sm:text-right' : 'sm:text-left'}>
                      <span className="font-playfair italic text-3xl md:text-4xl text-rosegold/50 dark:text-goldAccent/45 block mb-2">
                        {item.step}
                      </span>
                      <h3 className="font-playfair text-xl md:text-2xl font-medium tracking-wide text-darktext dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="font-roboto text-sm leading-relaxed opacity-80 font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Central Node Indicator */}
                  <div className="absolute left-4 sm:left-1/2 flex items-center justify-center -translate-x-1/2 w-8 h-8 rounded-full border border-rosegold bg-ivory dark:bg-darkbg dark:border-goldAccent z-10 hidden sm:flex">
                    <div className="w-2.5 h-2.5 rounded-full bg-rosegold dark:bg-goldAccent" />
                  </div>

                  {/* Empty Side (Spacer for Desktop) */}
                  <div className="w-full sm:w-1/2 hidden sm:block" />
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Workflow;
