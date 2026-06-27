import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 border-t border-rosegold/20 dark:border-goldAccent/15 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo / Tagline */}
          <div className="space-y-4">
            <Link onClick={handleScrollToTop} to="/" className="font-playfair text-2xl font-bold tracking-widest text-darktext dark:text-goldAccent">
              EvenAfter
            </Link>
            <p className="font-playfair italic text-xs text-rosegold dark:text-goldAccent uppercase tracking-widest">
              Crafting Unforgettable Celebrations
            </p>
            <p className="font-roboto text-xs leading-relaxed opacity-75 font-light">
              Bridging high-end planning with verified craftsmanship. A secure milestone platform for unforgettable weddings.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="font-playfair text-sm font-semibold uppercase tracking-wider text-rosegold dark:text-goldAccent">
              Company
            </h4>
            <ul className="space-y-2 text-xs font-light tracking-wide">
              <li><a href="/#about" className="hover:text-rosegold dark:hover:text-goldAccent transition-colors">Our Heritage</a></li>
              <li><a href="/#features" className="hover:text-rosegold dark:hover:text-goldAccent transition-colors">Platform Features</a></li>
              <li><Link to="/pricing" className="hover:text-rosegold dark:hover:text-goldAccent transition-colors">Pricing Plans</Link></li>
              <li><a href="/#contact" className="hover:text-rosegold dark:hover:text-goldAccent transition-colors">Book Consultation</a></li>
            </ul>
          </div>

          {/* Platform Actions */}
          <div className="space-y-3">
            <h4 className="font-playfair text-sm font-semibold uppercase tracking-wider text-rosegold dark:text-goldAccent">
              Onboarding
            </h4>
            <ul className="space-y-2 text-xs font-light tracking-wide">
              <li><Link to="/login" className="hover:text-rosegold dark:hover:text-goldAccent transition-colors">Portal Login</Link></li>
              <li><Link to="/register" className="hover:text-rosegold dark:hover:text-goldAccent transition-colors">Partner Registration</Link></li>
              <li><Link to="/register" className="hover:text-rosegold dark:hover:text-goldAccent transition-colors">Client Signup</Link></li>
            </ul>
          </div>

          {/* Social connections */}
          <div className="space-y-4">
            <h4 className="font-playfair text-sm font-semibold uppercase tracking-wider text-rosegold dark:text-goldAccent">
              Connect
            </h4>
            <div className="flex space-x-4 text-rosegold dark:text-goldAccent">
              <a href="#" className="hover:scale-110 transition-transform"><FiInstagram className="w-5 h-5" /></a>
              <a href="#" className="hover:scale-110 transition-transform"><FiFacebook className="w-5 h-5" /></a>
              <a href="#" className="hover:scale-110 transition-transform"><FiTwitter className="w-5 h-5" /></a>
            </div>
            <p className="text-[10px] opacity-60 font-light leading-relaxed">
              Based in Manhattan, NY.<br />
              info@everafterweddings.com
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-rosegold/10 dark:border-goldAccent/10 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 text-xs opacity-70 font-light">
          <p>© {new Date().getFullYear()} EverAfter Weddings & EvenAfter. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-rosegold dark:hover:text-goldAccent">Privacy Policy</a>
            <a href="#" className="hover:text-rosegold dark:hover:text-goldAccent">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
