import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Features from '../components/Features';
import Workflow from '../components/Workflow';
import Statistics from '../components/Statistics';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 font-roboto min-h-screen select-none overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Workflow />
      <Statistics />
      <Gallery />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
