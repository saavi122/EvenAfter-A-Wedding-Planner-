import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMapPin, FiCalendar, FiMessageSquare, FiBriefcase, FiUserCheck, FiChevronRight, FiCheck, FiX, FiAward, FiGlobe, FiPhone, FiMail, FiHeart, FiGrid, FiSmile, FiCompass, FiShield } from 'react-icons/fi';

export const PlannerProfile = () => {
  const { plannerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Selected tab / portfolio category filter
  const [portfolioFilter, setPortfolioFilter] = useState('All Events');

  // Lightbox zoom state
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Modal triggers
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isHireOpen, setIsHireOpen] = useState(false);

  // Form states
  const [meetingForm, setMeetingForm] = useState({ date: '', time: '', agenda: '', meetingType: 'Google Meet' });
  const [hireForm, setHireForm] = useState({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  // Inject Google Fonts dynamically on mount for the luxury wedding theme
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Alex+Brush&family=Montserrat:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Open booking modal if "?book=true" is passed in query string
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('book') === 'true') {
      setIsMeetingOpen(true);
    }
  }, [location.search]);

  // 1. Fetch planner profile details
  const { data: plannerResponse, isLoading: plannerLoading } = useQuery({
    queryKey: ['planner', plannerId],
    queryFn: async () => {
      const res = await fetch(`/api/planners/${plannerId}`);
      if (!res.ok) throw new Error('Failed to load planner profile');
      return res.json();
    }
  });

  const planner = plannerResponse?.data;

  // 2. Fetch portfolio data
  const { data: portfolioResponse, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', plannerId],
    queryFn: async () => {
      const res = await fetch(`/api/planners/${plannerId}/portfolio`);
      if (!res.ok) throw new Error('Failed to load portfolio');
      return res.json();
    },
    enabled: !!plannerId
  });

  const portfolio = portfolioResponse?.data || { images: [], videos: [], testimonials: [] };

  // 3. Fetch reviews data
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', plannerId],
    queryFn: async () => {
      const res = await fetch(`/api/planners/${plannerId}/reviews`);
      if (!res.ok) throw new Error('Failed to load reviews');
      return res.json();
    },
    enabled: !!plannerId
  });

  const reviews = reviewsResponse?.data || [];

  // Mutations
  const scheduleMeetingMutation = useMutation({
    mutationFn: async (meetingData) => {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meetingData, plannerId: planner._id })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to schedule meeting');
      return result;
    },
    onSuccess: () => {
      showToast("Meeting booked successfully! Check details in your calendar.", "success");
      setIsMeetingOpen(false);
      setMeetingForm({ date: '', time: '', agenda: '', meetingType: 'Google Meet' });
      queryClient.invalidateQueries({ queryKey: ['myPlanner'] });
    },
    onError: (err) => {
      showToast(err.message || "Error scheduling meeting", "error");
    }
  });

  const hirePlannerMutation = useMutation({
    mutationFn: async (requestData) => {
      const res = await fetch('/api/planner-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestData, plannerId: planner._id })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to send request');
      return result;
    },
    onSuccess: () => {
      showToast("Hiring proposal submitted! Planner will review details.", "success");
      setIsHireOpen(false);
      setHireForm({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });
    },
    onError: (err) => {
      showToast(err.message || "Error sending proposal", "error");
    }
  });

  const handleMeetingSubmit = (e) => {
    e.preventDefault();
    scheduleMeetingMutation.mutate(meetingForm);
  };

  const handleHireSubmit = (e) => {
    e.preventDefault();
    hirePlannerMutation.mutate(hireForm);
  };

  if (plannerLoading || portfolioLoading || reviewsLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center bg-[#fcf9f5]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-amber-800/10 border-t-amber-800 animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-amber-900/60 uppercase">Curating profile credentials...</p>
        </div>
      </div>
    );
  }

  if (!planner) {
    return (
      <div className="text-center py-16 bg-[#fcf9f5] min-h-[60vh] flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-amber-900">Planner profile not found</h3>
        <button onClick={() => navigate('/client/planners')} className="mt-4 px-5 py-2.5 bg-amber-800 text-white rounded-xl text-xs font-bold shadow">
          Back to Directory
        </button>
      </div>
    );
  }

  // Portfolio image filtering logic based on selected category
  const portfolioImages = portfolio.images || [];
  const filteredImages = portfolioImages.filter((img, index) => {
    if (portfolioFilter === 'All Events') return true;
    if (portfolioFilter === 'Wedding') return index % 3 === 0;
    if (portfolioFilter === 'Engagement') return index % 3 === 1;
    if (portfolioFilter === 'Destination') return index % 3 === 2;
    if (portfolioFilter === 'Reception') return index % 2 === 0;
    return true;
  });

  // Services icons mapping helper
  const services = [
    { title: "Full Wedding Planning", icon: FiBriefcase },
    { title: "Destination Weddings", icon: FiGlobe },
    { title: "Venue Management", icon: FiCompass },
    { title: "Decor & Design", icon: FiStar },
    { title: "Entertainment Management", icon: FiSmile }
  ];

  // Stats block mapping helper
  const stats = [
    { value: planner.assignedEvents || "250+", label: "Events Planned" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "50+", label: "Cities Covered" },
    { value: "25+", label: "Team Members" }
  ];

  const socialLinks = [
    { url: "https://instagram.com", icon: "📸" },
    { url: "https://facebook.com", icon: "👤" },
    { url: "https://pinterest.com", icon: "📌" },
    { url: "https://youtube.com", icon: "🎥" }
  ];

  return (
    <div className="bg-[#fcf9f5] text-slate-800 p-4 md:p-8 rounded-[40px] shadow-2xl border border-amber-900/10 min-h-screen relative overflow-hidden font-sans">
      
      {/* Delicate floral motif corner backgrounds */}
      <div className="absolute top-0 left-0 w-24 h-24 opacity-15 pointer-events-none border-t border-l border-amber-900/30 m-4" />
      <div className="absolute bottom-0 right-0 w-24 h-24 opacity-15 pointer-events-none border-b border-r border-amber-900/30 m-4" />

      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-5 py-3 rounded-2xl shadow-xl text-white text-xs font-bold border ${
              toast.type === 'success' ? 'bg-[#b88e5d] border-[#a0794e]' : 'bg-rose-600 border-rose-500'
            }`}
          >
            {toast.type === 'success' ? <FiCheck className="w-5 h-5" /> : <FiX className="w-5 h-5" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
        
        {/* ================================================= */}
        {/* LEFT COLUMN: ARCH PROFILE AND COMPANY SPECS       */}
        {/* ================================================= */}
        <div className="lg:col-span-4 space-y-8 flex flex-col items-center text-center lg:text-left lg:items-stretch lg:border-r lg:border-amber-900/10 lg:pr-8">
          
          {/* Elegant Arch Image Wrapper */}
          <div className="relative w-full max-w-[280px] lg:max-w-none aspect-[4/5] rounded-t-full rounded-b-[40px] overflow-hidden border border-amber-900/20 shadow-xl bg-amber-50/20 mx-auto">
            {/* Corner floral details overlay inside arch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs opacity-45 pointer-events-none font-serif italic text-amber-900">
              ❀ ✿ ❀
            </div>
            <img
              src={planner.profileImage || "https://addyevents.in/wp-content/uploads/2025/07/NRI-WEdding-Planner-.jpg"}
              alt={planner.name?.name || "Wedding Planner"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name & Titles */}
          <div className="space-y-2 mt-4 text-center">
            <h2 className="text-3xl font-extrabold tracking-wide text-[#5c4033]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {planner.name?.name || "Pankaj Sharma"}
            </h2>
            <p className="text-[11px] font-bold tracking-widest text-[#a0794e] uppercase">
              Wedding & Events Planner
            </p>
            <div className="flex items-center justify-center space-x-2 text-[10px] italic text-amber-800/80">
              <span className="h-px bg-amber-800/20 w-8" />
              <span>Creating Beautiful Memories That Last A Lifetime</span>
              <span className="h-px bg-amber-800/20 w-8" />
            </div>
          </div>

          {/* Specifications Table rows */}
          <div className="w-full border border-amber-900/10 rounded-3xl bg-white/40 p-5 space-y-3.5 text-xs text-slate-700">
            {[
              { label: "Experience", value: planner.exprience || "8+ Years", icon: FiBriefcase },
              { label: "Events Planned", value: `${planner.assignedEvents || '250+'} Weddings`, icon: FiCalendar },
              { label: "Specialization", value: planner.specialiazation || "Destination Weddings, Royal Weddings, Luxury Events", icon: FiStar },
              { label: "Location", value: planner.city || "Udaipur, Rajasthan", icon: FiMapPin },
              { label: "Languages", value: planner.languages?.join(', ') || "English, Hindi", icon: FiGlobe }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-start py-2 border-b border-amber-900/5 last:border-0 last:pb-0">
                <span className="font-semibold text-slate-500 flex items-center">
                  <item.icon className="mr-2 text-[#a0794e] w-4 h-4" />
                  {item.label}
                </span>
                <span className="text-right font-bold text-[#5c4033] max-w-[180px]">{item.value}</span>
              </div>
            ))}
          </div>

          {/* About Me card */}
          <div className="w-full border border-amber-900/10 rounded-3xl bg-white/40 p-6 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-amber-900/5 pb-2">About Me</h4>
            <p className="text-xs leading-relaxed text-slate-600 italic">
              "{planner.bio || 'I believe every wedding has a unique story and it deserves to be told in the most beautiful way. With years of experience in crafting unforgettable celebrations, I ensure every detail is perfect and every moment is magical.'}"
            </p>
            {/* Signature */}
            <div className="text-right pt-2 font-serif text-3xl text-[#a0794e]" style={{ fontFamily: "'Alex Brush', cursive" }}>
              {planner.name?.name || "Pankaj Sharma"}
            </div>
          </div>

          {/* Live Availability */}
          <div className="w-full py-3.5 px-6 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center space-x-2 text-xs font-bold text-emerald-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Available for New Projects</span>
          </div>

          {/* Social Links Footer */}
          <div className="flex items-center justify-center space-x-6 pt-2">
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-amber-900/10 hover:border-[#a0794e] hover:bg-[#a0794e]/10 flex items-center justify-center text-lg shadow-sm transition-all"
              >
                {link.icon}
              </a>
            ))}
          </div>

        </div>

        {/* ================================================= */}
        {/* RIGHT COLUMN: SERVICES, METRICS & 3X3 PORTFOLIO   */}
        {/* ================================================= */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* 1. Services Section */}
          <div className="space-y-5">
            <div className="text-center lg:text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#a0794e]" style={{ fontFamily: "'Playfair Display', serif" }}>
                My Services
              </h3>
              <div className="h-px bg-gradient-to-r from-[#a0794e]/40 to-transparent w-32 mt-1.5 mx-auto lg:mx-0" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {services.map((serv, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-amber-900/5 shadow-sm flex flex-col items-center text-center space-y-2.5 hover:shadow-md hover:border-accent/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-[#fcf9f5] border border-amber-900/5 text-[#a0794e] flex items-center justify-center group-hover:bg-[#a0794e] group-hover:text-white transition-all shadow-inner">
                    <serv.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">
                    {serv.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Stats Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/70 border border-amber-900/10 rounded-3xl p-6 shadow-sm">
            {stats.map((st, idx) => (
              <div key={idx} className="text-center space-y-1">
                <h3 className="text-2xl font-black text-[#5c4033]" style={{ fontFamily: "'Playfair Display', serif" }}>{st.value}</h3>
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">{st.label}</p>
              </div>
            ))}
          </div>

          {/* 3. Portfolio Grid Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-amber-900/10 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#a0794e]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Portfolio
                </h3>
                <div className="h-px bg-gradient-to-r from-[#a0794e]/40 to-transparent w-24 mt-1" />
              </div>

              {/* Filter Category pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {['All Events', 'Wedding', 'Engagement', 'Destination', 'Reception'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPortfolioFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                      portfolioFilter === filter
                        ? 'bg-[#a0794e] border-[#a0794e] text-white shadow-sm'
                        : 'bg-white border-amber-900/10 text-slate-500 hover:text-[#a0794e]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* 3x3 Luxury Wedding Grid */}
            {filteredImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveLightbox({ url: img })}
                    className="relative aspect-square rounded-3xl overflow-hidden border border-amber-900/10 cursor-pointer shadow-sm group bg-[#faf8f5]"
                  >
                    <img
                      src={img}
                      alt={`portfolio-${index}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#5c4033]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-[#a0794e] px-4 py-2 rounded-full shadow-lg border border-white/20">
                        View Image
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 glass border border-amber-900/10 rounded-3xl bg-white/40">
                <p className="text-xs">No gallery images available under this category.</p>
              </div>
            )}
          </div>

          {/* 4. Client Reviews Section */}
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#a0794e]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Client Reviews
              </h3>
              <div className="h-px bg-gradient-to-r from-[#a0794e]/40 to-transparent w-28 mt-1.5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((rev, idx) => (
                <div key={idx} className="p-5 rounded-3xl bg-white border border-amber-900/5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative">
                  <span className="absolute top-3 left-4 text-4xl text-[#a0794e]/10 font-serif leading-none">“</span>
                  
                  <div className="space-y-2 relative z-10">
                    {/* Stars */}
                    <div className="flex items-center space-x-0.5 text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <FiStar key={i} className="fill-current w-3.5 h-3.5" />
                      ))}
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-slate-500 italic">
                      "{rev.text}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-2.5 pt-3 border-t border-amber-900/5 mt-2">
                    <div className="w-8 h-8 rounded-full bg-[#a0794e]/10 text-[#a0794e] font-black text-xs flex items-center justify-center">
                      {rev.clientName?.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-800 leading-tight">{rev.clientName}</h5>
                      <span className="text-[9px] text-[#a0794e] font-semibold">Verified Udaipur Client</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Bottom CTA Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5c4033] to-[#7f5a46] p-6 text-white border border-amber-900/10 shadow-lg text-center flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Let's plan your dream wedding
              </h3>
              <p className="text-[11px] text-amber-250 font-light">
                Connect with me to discuss your custom event requirements & ideas.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate(`/client/chat/${planner.name?._id || planner.userId?._id}`)}
                className="px-5 py-2.5 bg-[#a0794e] hover:bg-[#b88e5d] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
              >
                <FiMessageSquare className="w-4 h-4" />
                <span>Connect Now</span>
              </button>
              <button
                onClick={() => setIsMeetingOpen(true)}
                className="px-5 py-2.5 bg-transparent border border-white/30 hover:border-white text-white font-bold text-xs rounded-xl transition-all"
              >
                Schedule a Call
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* LIGHTBOX PREVIEW */}
      <AnimatePresence>
        {activeLightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLightbox(null)}
              className="fixed inset-0 bg-[#2b1f1a]"
            />
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50 shadow"
            >
              <FiX className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center z-10"
            >
              <img
                src={activeLightbox.url}
                alt="Lightbox preview"
                className="rounded-3xl max-w-full max-h-[85vh] object-contain shadow-2xl border border-white/10"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE MEETING MODAL */}
      <AnimatePresence>
        {isMeetingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMeetingOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#fcf9f5] w-full max-w-md p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-2xl relative z-10 overflow-hidden text-xs font-semibold text-[#5c4033]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#5c4033] uppercase tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Schedule Call
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Book consultation call with {planner.name?.name}</p>
                </div>
                <button onClick={() => setIsMeetingOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 focus:border-[#a0794e]"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Meeting Time</label>
                  <input
                    type="time"
                    required
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 focus:border-[#a0794e]"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Meeting Platform</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 focus:border-[#a0794e]"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Internal Video Call">Internal Video Call</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Discussion Details</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Brief agenda..."
                    value={meetingForm.agenda}
                    onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 resize-none focus:border-[#a0794e]"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={scheduleMeetingMutation.isPending}
                  className="w-full py-3.5 bg-[#a0794e] hover:bg-[#b88e5d] text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{scheduleMeetingMutation.isPending ? 'Scheduling Call...' : 'Book Call'}</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HIRE PLANNER MODAL */}
      <AnimatePresence>
        {isHireOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHireOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#fcf9f5] w-full max-w-md p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-2xl relative z-10 overflow-hidden text-xs font-semibold text-[#5c4033]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#5c4033] uppercase tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Hire Wedding Planner
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Submit proposal to {planner.name?.name}</p>
                </div>
                <button onClick={() => setIsHireOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleHireSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Theme / Style</label>
                  <select
                    value={hireForm.weddingType}
                    onChange={(e) => setHireForm({ ...hireForm, weddingType: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 focus:border-[#a0794e]"
                  >
                    <option value="Royal Wedding">Royal Palace Wedding</option>
                    <option value="Destination Wedding">Destination Wedding</option>
                    <option value="Beach Wedding">Sunset Beach Wedding</option>
                    <option value="Luxury Wedding">Luxury Boutique Wedding</option>
                    <option value="Traditional Wedding">Traditional Heritage Wedding</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Planned Date</label>
                  <input
                    type="date"
                    required
                    value={hireForm.weddingDate}
                    onChange={(e) => setHireForm({ ...hireForm, weddingDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 focus:border-[#a0794e]"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Destination City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur, Goa..."
                    value={hireForm.location}
                    onChange={(e) => setHireForm({ ...hireForm, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 focus:border-[#a0794e]"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Budget (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7500000"
                    value={hireForm.budget}
                    onChange={(e) => setHireForm({ ...hireForm, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 focus:border-[#a0794e]"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-450">Brief Requirements</label>
                  <textarea
                    rows="3"
                    placeholder="Mandate details..."
                    value={hireForm.requirements}
                    onChange={(e) => setHireForm({ ...hireForm, requirements: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-900/10 outline-none text-slate-900 resize-none focus:border-[#a0794e]"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={hirePlannerMutation.isPending}
                  className="w-full py-3.5 bg-[#a0794e] hover:bg-[#b88e5d] text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{hirePlannerMutation.isPending ? 'Sending Proposal...' : 'Send Hiring Proposal'}</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PlannerProfile;
