import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';

const FAQ = () => {
  const faqs = [
    {
      question: "How does secure escrow protect both client and vendor?",
      answer: "When a contract is signed, the client funds the milestones into a secure vault. The planner or vendor can proceed with setup knowing the funds are guaranteed. Once the task or milestone is completed and verified, the funds are immediately released.",
    },
    {
      question: "Can I manage multiple events concurrently?",
      answer: "Yes. Our Super Admin dashboard and Planner panels support managing multiple timelines, budgets, and guest books across multiple high-end events without overlay conflicts.",
    },
    {
      question: "What happens if booking dates or schedules conflict?",
      answer: "Our AI timeline system automatically checks availability and flags conflicts. If disputes arise, built-in resolution channels allow teams to negotiate adjustments and track revisions transparently.",
    },
    {
      question: "Is there a curation layout for custom mood boards?",
      answer: "Yes, clients and planners can curate Pinterest-style mood boards, invite vendors to view materials, and attach files directly to specific milestone contracts for visual alignment.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] text-rosegold dark:text-goldAccent uppercase">Client Care</span>
          <h2 className="font-playfair text-3xl md:text-5xl font-light mt-2 tracking-wide text-darktext dark:text-white">
            Frequently Inquired
          </h2>
          <div className="w-12 h-[1px] bg-rosegold mx-auto mt-4 dark:bg-goldAccent" />
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div
                key={idx}
                className="border-b border-rosegold/20 dark:border-goldAccent/15 pb-4"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between py-4 text-left font-playfair text-lg md:text-xl font-light tracking-wide hover:text-rosegold dark:hover:text-goldAccent transition-colors duration-300 focus:outline-none"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <FiMinus className="w-5 h-5 text-rosegold dark:text-goldAccent" />
                  ) : (
                    <FiPlus className="w-5 h-5 text-rosegold dark:text-goldAccent" />
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="font-roboto text-sm md:text-base leading-relaxed text-darktext/75 dark:text-gray-400 font-light pr-8 pb-4">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
