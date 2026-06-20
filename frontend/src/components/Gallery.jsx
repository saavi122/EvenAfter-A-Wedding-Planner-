import React from 'react';
import { motion } from 'framer-motion';

const Gallery = () => {
  const images = [
    {
      url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600&auto=format&fit=crop",
      title: "Floral Arches",
      category: "Floral Design",
      height: "h-64",
    },
    {
      url: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=600&auto=format&fit=crop",
      title: "Bridal Couture",
      category: "Fashion",
      height: "h-[360px]",
    },
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
      title: "Table Reception",
      category: "Table Curation",
      height: "h-[280px]",
    },
    {
      url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop",
      title: "Invitation Suite",
      category: "Stationery",
      height: "h-[320px]",
    },
    {
      url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600&auto=format&fit=crop",
      title: "Evening Illumination",
      category: "Lighting",
      height: "h-72",
    },
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop",
      title: "The First Dance",
      category: "Moments",
      height: "h-96",
    },
  ];

  return (
    <section className="py-24 bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] text-rosegold dark:text-goldAccent uppercase">Curated Portfolios</span>
          <h2 className="font-playfair text-3xl md:text-5xl font-light mt-2 tracking-wide text-darktext dark:text-white">
            Moments of Perfection
          </h2>
          <div className="w-12 h-[1px] bg-rosegold mx-auto mt-4 dark:bg-goldAccent" />
        </div>

        {/* Pinterest Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.05 }}
              className="break-inside-avoid relative overflow-hidden rounded-lg border border-rosegold/10 dark:border-goldAccent/10 group cursor-pointer"
            >
              <div className={`${img.height} w-full overflow-hidden relative`}>
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Hover overlay text in magazine style */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 select-none">
                  <span className="text-[10px] tracking-widest text-goldAccent uppercase mb-1 font-semibold">
                    {img.category}
                  </span>
                  <h3 className="font-playfair text-lg text-white font-medium tracking-wide">
                    {img.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Gallery;
