import React, { useEffect, useState } from 'react';

const FlowerOverlay = () => {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    // Generate petals on mount
    const petalCount = 15;
    const items = Array.from({ length: petalCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${8 + Math.random() * 6}s`,
      size: `${10 + Math.random() * 15}px`,
      opacity: 0.3 + Math.random() * 0.4,
    }));
    setPetals(items);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Swaying Flower Garlands at the top */}
      <div className="absolute top-0 left-0 w-full flex justify-between px-8 md:px-20 select-none">
        {/* Left Garland */}
        <div className="origin-top animate-sway" style={{ animationDuration: '6s' }}>
          <svg className="w-16 md:w-24 h-48 md:h-64" viewBox="0 0 100 300" fill="none">
            {/* Hanging string */}
            <line x1="50" y1="0" x2="50" y2="280" stroke="#C9A27E" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            
            {/* Flowers along the string */}
            <circle cx="50" cy="40" r="12" fill="#F5EFE6" stroke="#C9A27E" strokeWidth="1" />
            <circle cx="50" cy="40" r="4" fill="#C9A27E" />
            <circle cx="50" cy="90" r="10" fill="#FAF7F2" stroke="#A8B8A3" strokeWidth="1" />
            <circle cx="50" cy="90" r="3" fill="#A8B8A3" />
            <circle cx="50" cy="150" r="14" fill="#F5EFE6" stroke="#C9A27E" strokeWidth="1" />
            <circle cx="50" cy="150" r="5" fill="#C9A27E" />
            <circle cx="50" cy="210" r="10" fill="#FAF7F2" stroke="#A8B8A3" strokeWidth="1" />
            <circle cx="50" cy="210" r="3" fill="#A8B8A3" />
            <circle cx="50" cy="260" r="12" fill="#F5EFE6" stroke="#C9A27E" strokeWidth="1" />
            <circle cx="50" cy="260" r="4" fill="#C9A27E" />

            {/* Accent leaves */}
            <path d="M 50 65 C 35 65, 35 75, 50 75" fill="#A8B8A3" opacity="0.7" />
            <path d="M 50 120 C 65 120, 65 130, 50 130" fill="#A8B8A3" opacity="0.7" />
            <path d="M 50 180 C 35 180, 35 190, 50 190" fill="#A8B8A3" opacity="0.7" />
          </svg>
        </div>

        {/* Right Garland */}
        <div className="origin-top animate-sway" style={{ animationDuration: '8s', animationDelay: '-2s' }}>
          <svg className="w-16 md:w-24 h-48 md:h-64" viewBox="0 0 100 300" fill="none">
            {/* Hanging string */}
            <line x1="50" y1="0" x2="50" y2="280" stroke="#C9A27E" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            
            {/* Flowers along the string */}
            <circle cx="50" cy="50" r="10" fill="#FAF7F2" stroke="#A8B8A3" strokeWidth="1" />
            <circle cx="50" cy="50" r="3" fill="#A8B8A3" />
            <circle cx="50" cy="110" r="14" fill="#F5EFE6" stroke="#C9A27E" strokeWidth="1" />
            <circle cx="50" cy="110" r="5" fill="#C9A27E" />
            <circle cx="50" cy="170" r="10" fill="#FAF7F2" stroke="#A8B8A3" strokeWidth="1" />
            <circle cx="50" cy="170" r="3" fill="#A8B8A3" />
            <circle cx="50" cy="230" r="12" fill="#F5EFE6" stroke="#C9A27E" strokeWidth="1" />
            <circle cx="50" cy="230" r="4" fill="#C9A27E" />

            {/* Accent leaves */}
            <path d="M 50 80 C 65 80, 65 90, 50 90" fill="#A8B8A3" opacity="0.7" />
            <path d="M 50 140 C 35 140, 35 150, 50 150" fill="#A8B8A3" opacity="0.7" />
            <path d="M 50 200 C 65 200, 65 210, 50 210" fill="#A8B8A3" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Drifting Falling Petals */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-petal"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            width: petal.size,
            height: petal.size,
            opacity: petal.opacity,
          }}
        >
          {/* Petal SVG */}
          <svg className="w-full h-full text-rosegold/40 dark:text-goldAccent/25" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10,0 C15,5 20,10 15,15 C10,20 5,20 2,15 C-1,10 5,5 10,0 Z" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FlowerOverlay;
