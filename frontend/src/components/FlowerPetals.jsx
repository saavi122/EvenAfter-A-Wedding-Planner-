import React, { useState, useEffect } from 'react';

export const FlowerPetals = () => {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    // Generate 25 petals with random properties on mount
    const generatedPetals = Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 15 + 10; // size between 10px and 25px
      const left = Math.random() * 100; // left position %
      const delay = Math.random() * 8; // delay up to 8s
      const duration = Math.random() * 10 + 10; // speed between 10s and 20s
      const rotation = Math.random() * 360; // initial rotation angle
      
      return {
        id: i,
        style: {
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          transform: `rotate(${rotation}deg)`,
        }
      };
    });
    setPetals(generatedPetals);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal"
          style={petal.style}
        />
      ))}
    </div>
  );
};

export default FlowerPetals;
