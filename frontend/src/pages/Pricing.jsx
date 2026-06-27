import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheck,
  FiStar,
  FiZap,
  FiShield,
  FiPercent,
  FiChevronDown,
  FiAward,
  FiTrendingUp,
  FiArrowRight,
  FiPlus,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ─── Indian number formatter ─── */
const formatINR = (num) =>
  new Intl.NumberFormat('en-IN').format(Math.round(num));

/* ─── Pricing data ─── */
const plannerPlans = [
  {
    name: 'Free',
    monthly: 0,
    popular: false,
    cta: 'Get Started',
    ctaStyle: 'outline',
    icon: FiStar,
    features: [
      'Create and manage profile',
      'Portfolio showcase',
      'Up to 3 client inquiries / month',
      'Basic analytics dashboard',
    ],
  },
  {
    name: 'Pro Planner',
    monthly: 999,
    popular: true,
    cta: 'Upgrade Now',
    ctaStyle: 'solid',
    icon: FiZap,
    features: [
      'Everything in Free',
      'Unlimited client inquiries',
      'Featured listing in search results',
      'Advanced analytics & lead management',
      'Client reviews and ratings',
    ],
  },
  {
    name: 'Premium Planner',
    monthly: 2499,
    popular: false,
    cta: 'Upgrade Now',
    ctaStyle: 'solid',
    icon: FiAward,
    features: [
      'Everything in Pro',
      'Priority placement in search results',
      'AI-powered lead matching',
      'Team collaboration tools',
      'Dedicated support',
      'Custom portfolio website',
    ],
  },
];

const vendorPlans = [
  {
    name: 'Free',
    monthly: 0,
    popular: false,
    cta: 'Get Started',
    ctaStyle: 'outline',
    icon: FiStar,
    features: [
      'Basic business profile',
      'Upload up to 10 portfolio images',
      'Receive client inquiries',
    ],
  },
  {
    name: 'Vendor Pro',
    monthly: 799,
    popular: true,
    cta: 'Upgrade Now',
    ctaStyle: 'solid',
    icon: FiZap,
    features: [
      'Everything in Free',
      'Unlimited portfolio uploads',
      'Featured category listing',
      'Analytics dashboard',
      'Priority lead notifications',
    ],
  },
  {
    name: 'Vendor Elite',
    monthly: 1999,
    popular: false,
    cta: 'Upgrade Now',
    ctaStyle: 'solid',
    icon: FiAward,
    features: [
      'Everything in Pro',
      'Homepage promotion',
      'Verified badge',
      'AI recommendation boost',
      'Dedicated support',
    ],
  },
];

const commissionTiers = [
  {
    range: 'Up to ₹50,000',
    rate: '5%',
    description: 'Standard bookings',
    icon: FiPercent,
  },
  {
    range: '₹50,001 – ₹2,00,000',
    rate: '4%',
    description: 'Mid-tier bookings',
    icon: FiTrendingUp,
  },
  {
    range: 'Above ₹2,00,000',
    rate: '3%',
    description: 'Premium bookings',
    icon: FiAward,
  },
];

const addOns = [
  {
    title: 'Featured Listings',
    description: 'Get prominent placement and attract more clients.',
    icon: FiStar,
    cta: 'Become Featured',
    items: [
      { label: 'Featured Planner (7 Days)', price: 299 },
      { label: 'Featured Planner (30 Days)', price: 999 },
      { label: 'Featured Vendor (7 Days)', price: 199 },
      { label: 'Featured Vendor (30 Days)', price: 799 },
    ],
  },
  {
    title: 'Verification Badges',
    description: 'Build trust with a verified profile badge.',
    icon: FiShield,
    cta: 'Get Verified',
    items: [
      { label: 'Planner Verification', price: 499, suffix: '/year' },
      { label: 'Vendor Verification', price: 299, suffix: '/year' },
    ],
  },
];

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time from your dashboard. When upgrading, you only pay the prorated difference for the remaining billing period.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes! Every paid plan comes with a 14-day free trial so you can explore all premium features risk-free. No credit card required to start.',
  },
  {
    q: 'How does the commission structure work?',
    a: 'We charge a small commission only on confirmed bookings processed through the platform. The rate decreases as your booking value increases, rewarding higher-value transactions.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards, UPI, net banking, and popular wallets. All transactions are secured with 256-bit SSL encryption.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. There are no long-term contracts. You can cancel your subscription at any time and continue using the plan until the end of your current billing cycle.',
  },
];

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PricingCard
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const PricingCard = ({ plan, isYearly }) => {
  const monthlyPrice = plan.monthly;
  const yearlyTotal = Math.round(monthlyPrice * 12 * 0.8);
  const yearlySaving = monthlyPrice * 12 - yearlyTotal;
  const displayPrice = isYearly ? yearlyTotal : monthlyPrice;
  const suffix = isYearly ? '/year' : '/month';
  const Icon = plan.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(201,162,126,0.15)' }}
      className={`relative luxury-card rounded-3xl p-8 flex flex-col justify-between h-full transition-all duration-300 ${
        plan.popular
          ? 'border-2 border-rosegold dark:border-goldAccent shadow-xl shadow-rosegold/10 dark:shadow-goldAccent/10 z-10 mt-4'
          : 'border border-rosegold/20 dark:border-goldAccent/15'
      }`}
    >
      {/* Glow ring for popular */}
      {plan.popular && (
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-rosegold/20 via-transparent to-goldAccent/20 dark:from-goldAccent/20 dark:to-rosegold/20 blur-sm -z-10" />
      )}

      {/* Most Preferred badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 right-6">
          <span className="inline-flex items-center gap-1.5 bg-ivory dark:bg-darkbg border border-rosegold dark:border-goldAccent text-rosegold dark:text-goldAccent text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
            <FiZap className="w-3 h-3" />
            Most Preferred
          </span>
        </div>
      )}

      <div>
        {/* Icon & Plan name */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-rosegold/10 dark:bg-goldAccent/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-rosegold dark:text-goldAccent" />
          </div>
          <h3 className="font-playfair text-xl font-bold">{plan.name}</h3>
        </div>

        {/* Price display */}
        <div className="mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={isYearly ? 'yearly' : 'monthly'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-end gap-1"
            >
              {isYearly && monthlyPrice > 0 && (
                <span className="text-sm line-through opacity-40 mr-1 mb-1">
                  ₹{formatINR(monthlyPrice * 12)}
                </span>
              )}
              <span className="text-4xl font-playfair font-bold text-rosegold dark:text-goldAccent">
                ₹{formatINR(displayPrice)}
              </span>
              <span className="text-sm opacity-60 mb-1">{monthlyPrice === 0 ? '/month' : suffix}</span>
            </motion.div>
          </AnimatePresence>
          {isYearly && yearlySaving > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block mt-2 text-xs font-semibold text-sage dark:text-sage bg-sage/10 dark:bg-sage/15 px-3 py-1 rounded-full"
            >
              Save ₹{formatINR(yearlySaving)}
            </motion.span>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-rosegold/15 dark:bg-goldAccent/15 mb-6" />

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <FiCheck className="w-4 h-4 mt-0.5 text-rosegold dark:text-goldAccent flex-shrink-0" />
              <span className="opacity-80">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <Link
        to={plan.monthly === 0 ? `/register?plan=${encodeURIComponent(plan.name)}` : "/billing"}
        state={plan.monthly > 0 ? { planName: plan.name, price: displayPrice, isYearly } : undefined}
        className={`block text-center text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all duration-300 mt-8 hover:scale-[1.02] active:scale-[0.98] ${
          plan.ctaStyle === 'solid'
            ? 'bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black shadow-md'
            : 'border-2 border-rosegold/40 dark:border-goldAccent/40 text-rosegold dark:text-goldAccent hover:bg-rosegold/5 dark:hover:bg-goldAccent/5'
        }`}
      >
        {plan.cta}
        <FiArrowRight className="inline-block ml-2 w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FAQ Accordion Item
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const FAQItem = ({ faq, isOpen, toggle }) => (
  <div className="border-b border-rosegold/15 dark:border-goldAccent/10">
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between py-6 sm:py-7 text-left cursor-pointer group"
    >
      <span
        className={`font-playfair text-base sm:text-lg pr-6 transition-colors duration-300 ${
          isOpen
            ? 'text-rosegold dark:text-goldAccent font-semibold'
            : 'text-darktext/80 dark:text-gray-300 group-hover:text-rosegold dark:group-hover:text-goldAccent'
        }`}
      >
        {faq.q}
      </span>
      <motion.span
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex-shrink-0"
      >
        <FiPlus className="w-5 h-5 text-rosegold/60 dark:text-goldAccent/60" />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="pb-6 sm:pb-7 pr-12 text-sm sm:text-base leading-relaxed text-darktext/60 dark:text-gray-400">
            {faq.a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Main Pricing Page
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [activeTab, setActiveTab] = useState('planner');
  const [openFAQ, setOpenFAQ] = useState(null);

  const activePlans = activeTab === 'planner' ? plannerPlans : vendorPlans;

  return (
    <div className="bg-ivory dark:bg-darkbg text-darktext dark:text-gray-300 font-roboto min-h-screen select-none overflow-x-hidden transition-colors duration-300">
      <Navbar />

      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-ivory to-champagne/30 dark:from-darkbg dark:via-darkcard dark:to-darkbg -z-10" />

        {/* Decorative elements */}
        <div className="absolute top-28 left-10 w-24 h-px bg-rosegold/20 dark:bg-goldAccent/20 rotate-45" />
        <div className="absolute top-40 right-16 w-2 h-2 rounded-full bg-rosegold/30 dark:bg-goldAccent/30" />
        <div className="absolute bottom-20 left-1/4 w-16 h-px bg-rosegold/15 dark:bg-goldAccent/15" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-champagne/40 dark:bg-goldAccent/20" />
        <div className="absolute bottom-10 right-20 w-32 h-px bg-gradient-to-r from-transparent via-rosegold/20 to-transparent dark:via-goldAccent/20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-playfair italic text-xs sm:text-sm text-rosegold dark:text-goldAccent uppercase tracking-[0.3em] mb-4"
          >
            Transparent Pricing
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            Plans That Grow{' '}
            <span className="text-rosegold dark:text-goldAccent">With Your Business</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg opacity-70 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you're a wedding planner building your clientele or a vendor showcasing
            your craft, our flexible plans are designed to scale with your success.
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 mx-auto w-40 h-px bg-gradient-to-r from-transparent via-rosegold/40 to-transparent dark:via-goldAccent/40"
          />
        </div>
      </section>

      {/* ─── 2. BILLING TOGGLE ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-6"
        >
          <button
            onClick={() => setIsYearly(false)}
            className={`text-base font-medium tracking-wide transition-all duration-300 relative pb-1 border-b-2 cursor-pointer ${
              !isYearly
                ? 'text-rosegold dark:text-goldAccent border-rosegold dark:border-goldAccent font-semibold'
                : 'text-darktext/40 dark:text-gray-500 border-transparent hover:text-darktext/70'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`text-base font-medium tracking-wide transition-all duration-300 relative pb-1 border-b-2 cursor-pointer flex items-center gap-2 ${
              isYearly
                ? 'text-rosegold dark:text-goldAccent border-rosegold dark:border-goldAccent font-semibold'
                : 'text-darktext/40 dark:text-gray-500 border-transparent hover:text-darktext/70'
            }`}
          >
            <span>Yearly</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-sage/15 text-sage dark:text-sage px-2 py-0.5 rounded-md">
              Save 20%
            </span>
          </button>
        </motion.div>
      </section>

      {/* ─── 3. USER TYPE TABS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center bg-cream/40 dark:bg-darkcard/60 p-1.5 rounded-2xl border border-rosegold/10 dark:border-goldAccent/10">
            {[
              { id: 'planner', label: 'For Planners' },
              { id: 'vendor', label: 'For Vendors' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-rosegold dark:bg-goldAccent text-white dark:text-black shadow-md'
                    : 'text-darktext/60 dark:text-gray-400 hover:text-darktext dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── 4. PRICING CARDS ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch"
          >
            {activePlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} isYearly={isYearly} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ─── 5. PLATFORM COMMISSION ─── */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/60 via-ivory to-cream/60 dark:from-darkcard/50 dark:via-darkbg dark:to-darkcard/50 -z-10" />
        <div className="absolute top-10 left-10 w-24 h-px bg-rosegold/10 dark:bg-goldAccent/10" />
        <div className="absolute bottom-10 right-10 w-24 h-px bg-rosegold/10 dark:bg-goldAccent/10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="font-playfair italic text-xs text-rosegold dark:text-goldAccent uppercase tracking-[0.3em] mb-3">
              Fair & Transparent
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">
              Platform Commission
            </h2>
            <p className="text-sm opacity-60 max-w-lg mx-auto">
              We only earn when you do. Our tiered commission structure rewards your growth
              with lower rates on higher-value bookings.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {commissionTiers.map((tier, i) => {
              const TierIcon = tier.icon;
              return (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  whileHover={{ y: -4 }}
                  className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-8 text-center"
                >
                  <div
                    className="mx-auto rounded-xl bg-rosegold/10 dark:bg-goldAccent/10 flex items-center justify-center mb-6"
                    style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}
                  >
                    <TierIcon className="w-5 h-5 text-rosegold dark:text-goldAccent" />
                  </div>
                  <p className="font-playfair text-3xl font-bold text-rosegold dark:text-goldAccent mb-2">
                    {tier.rate}
                  </p>
                  <p className="text-sm font-semibold mb-1">{tier.description}</p>
                  <p className="text-xs opacity-50">{tier.range}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── 6. ADD-ON FEATURES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-playfair italic text-xs text-rosegold dark:text-goldAccent uppercase tracking-[0.3em] mb-3">
            À La Carte
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">
            Add-On Features
          </h2>
          <p className="text-sm opacity-60 max-w-lg mx-auto">
            Boost your visibility and credibility with our premium add-ons,
            available with any plan.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {addOns.map((addon, i) => {
            const AddonIcon = addon.icon;
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="luxury-card rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 p-8 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-rosegold/10 dark:bg-goldAccent/10 flex items-center justify-center">
                      <AddonIcon className="w-5 h-5 text-rosegold dark:text-goldAccent" />
                    </div>
                    <h3 className="font-playfair text-xl font-bold">{addon.title}</h3>
                  </div>
                  <p className="text-sm opacity-60 mb-6">{addon.description}</p>

                  <div className="space-y-3 mb-10">
                    {addon.items.map((item, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between py-3 px-5 rounded-xl bg-cream/40 dark:bg-darkcard/50 border border-rosegold/20 dark:border-goldAccent/15"
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm font-bold text-rosegold dark:text-goldAccent whitespace-nowrap ml-4">
                          ₹{formatINR(item.price)}
                          {item.suffix && (
                            <span className="text-xs opacity-60 font-normal ml-0.5">{item.suffix}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Link
                    to="/billing"
                    state={
                      i === 0
                        ? { planName: 'Featured Vendor (30 Days)', price: 799 }
                        : { planName: 'Vendor Verification', price: 299 }
                    }
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent border-2 border-rosegold/30 dark:border-goldAccent/30 px-6 py-3 rounded-xl hover:bg-rosegold/5 dark:hover:bg-goldAccent/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {addon.cta}
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── 7. FAQ SECTION ─── */}
      <section className="relative py-24 sm:py-32">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-ivory to-cream/30 dark:from-darkcard/20 dark:via-darkbg dark:to-darkcard/20 -z-10" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold text-rosegold dark:text-goldAccent uppercase tracking-[0.35em] mb-4">
              Client Care
            </p>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-darktext dark:text-white">
              Frequently Inquired
            </h2>
            <div className="w-10 h-[2px] bg-rosegold dark:bg-goldAccent mx-auto mt-5 rounded-full" />
          </motion.div>

          {/* FAQ List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border-t border-rosegold/15 dark:border-goldAccent/10"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={cardVariants}>
                <FAQItem
                  faq={faq}
                  isOpen={openFAQ === i}
                  toggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 8. FINAL CTA ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 bg-gradient-to-br from-cream/80 via-ivory to-champagne/20 dark:from-darkcard/80 dark:via-darkbg dark:to-darkcard/60 p-12 sm:p-16 text-center"
        >
          {/* Decorative gradients — inside the card */}
          <div className="absolute top-6 left-6 w-32 h-32 bg-rosegold/5 dark:bg-goldAccent/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-32 h-32 bg-champagne/10 dark:bg-goldAccent/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <p className="font-playfair italic text-xs text-rosegold dark:text-goldAccent uppercase tracking-[0.3em] mb-4">
              Get Started Today
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Ready to Grow Your{' '}
              <span className="text-rosegold dark:text-goldAccent">Wedding Business</span>?
            </h2>
            <p className="text-sm sm:text-base opacity-60 max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of wedding professionals who trust EvenAfter to connect them
              with their ideal clients. Start free, upgrade when you're ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Free Account
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 border-2 border-rosegold/30 dark:border-goldAccent/30 text-rosegold dark:text-goldAccent text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-rosegold/5 dark:hover:bg-goldAccent/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Contact Sales
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
