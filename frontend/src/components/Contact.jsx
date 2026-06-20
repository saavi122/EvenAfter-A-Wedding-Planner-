import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventType: 'wedding',
    message: '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate consultation submission
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFormData({ name: '', email: '', eventType: 'wedding', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-24 bg-cream/30 dark:bg-black/25 text-darktext dark:text-gray-300 transition-colors duration-300 relative">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] text-rosegold dark:text-goldAccent uppercase">Inquiries</span>
          <h2 className="font-playfair text-3xl md:text-5xl font-light mt-2 tracking-wide text-darktext dark:text-white">
            Begin Your EverAfter
          </h2>
          <div className="w-12 h-[1px] bg-rosegold mx-auto mt-4 dark:bg-goldAccent" />
          <p className="font-roboto text-sm tracking-wide opacity-80 mt-4 max-w-md mx-auto font-light">
            Fill out our refined inquiry form to secure a premium consultation with our lead event coordinators.
          </p>
        </div>

        {/* Form Container */}
        <div className="border border-rosegold/20 bg-white/40 dark:border-goldAccent/15 dark:bg-darkcard/30 p-8 md:p-12 rounded-xl backdrop-blur-md shadow-sm">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <h3 className="font-playfair text-2xl font-light text-rosegold dark:text-goldAccent italic">
                Inquiry Received Gracefully
              </h3>
              <p className="font-roboto text-sm opacity-80 max-w-sm mx-auto font-light">
                An expert curator from EverAfter Weddings will contact you shortly to schedule your personalized layout review.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-darktext/70 dark:text-gray-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/55 dark:bg-black/45 border border-rosegold/20 dark:border-goldAccent/15 rounded focus:outline-none focus:border-rosegold dark:focus:border-goldAccent text-sm transition-all duration-300 placeholder:text-gray-400/60"
                    placeholder="E.g. Charlotte Rose"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-darktext/70 dark:text-gray-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/55 dark:bg-black/45 border border-rosegold/20 dark:border-goldAccent/15 rounded focus:outline-none focus:border-rosegold dark:focus:border-goldAccent text-sm transition-all duration-300 placeholder:text-gray-400/60"
                    placeholder="E.g. charlotte@example.com"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <label htmlFor="eventType" className="text-xs font-semibold uppercase tracking-wider text-darktext/70 dark:text-gray-400">
                  Event Category
                </label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-4 py-3 bg-white/55 dark:bg-black/45 border border-rosegold/20 dark:border-goldAccent/15 rounded focus:outline-none focus:border-rosegold dark:focus:border-goldAccent text-sm transition-all duration-300 text-darktext/80 dark:text-gray-300"
                >
                  <option value="wedding">Luxury Wedding Celebration</option>
                  <option value="anniversary">Milestone Anniversary Gala</option>
                  <option value="reception">Editorial Reception & Dinner</option>
                  <option value="corporate">High-End Corporate Soirée</option>
                </select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-darktext/70 dark:text-gray-400">
                  Curation Vision & Details
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white/55 dark:bg-black/45 border border-rosegold/20 dark:border-goldAccent/15 rounded focus:outline-none focus:border-rosegold dark:focus:border-goldAccent text-sm transition-all duration-300 placeholder:text-gray-400/60 resize-none"
                  placeholder="Share a details description of your styling, planning preferences, or requested vendor specialties..."
                />
              </div>

              {/* Submit Button */}
              <div className="text-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full sm:w-auto px-10 py-3.5 bg-rosegold hover:bg-rosegold/90 text-white dark:bg-goldAccent dark:hover:bg-goldAccent/90 dark:text-black font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] rounded shadow transition-all duration-300"
                >
                  Submit Inquiry
                </motion.button>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};

export default Contact;
