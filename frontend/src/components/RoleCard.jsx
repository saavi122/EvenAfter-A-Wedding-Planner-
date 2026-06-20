import React from 'react';
import { motion } from 'framer-motion';

const RoleCard = ({ role, title, description, icon: Icon, selected, onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-6 text-left border rounded-xl transition-all duration-300 backdrop-blur-md overflow-hidden ${
        selected
          ? 'bg-cream/40 border-rosegold text-darktext shadow-md dark:bg-goldAccent/10 dark:border-goldAccent dark:text-goldAccent'
          : 'bg-white/30 border-rosegold/20 hover:border-rosegold/50 text-darktext/80 dark:bg-black/30 dark:border-goldAccent/10 dark:hover:border-goldAccent/30 dark:text-gray-300'
      }`}
    >
      {/* Decorative background circle */}
      <div
        className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full transition-all duration-300 ${
          selected ? 'bg-rosegold/10 dark:bg-goldAccent/10' : 'bg-transparent'
        }`}
      />

      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg border transition-all duration-300 ${
            selected
              ? 'bg-rosegold/20 border-rosegold text-rosegold dark:bg-goldAccent/20 dark:border-goldAccent dark:text-goldAccent'
              : 'bg-white/50 border-rosegold/10 text-rosegold dark:bg-black/50 dark:border-goldAccent/10 dark:text-goldAccent'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h3 className="font-playfair text-lg font-bold tracking-wide transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm mt-1 leading-relaxed opacity-80">{description}</p>
        </div>
      </div>

      {/* Decorative corner indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rosegold dark:bg-goldAccent" />
      )}
    </motion.button>
  );
};

export default RoleCard;
