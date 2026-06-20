import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, FiMapPin, FiCalendar, FiMessageSquare, FiBriefcase, 
  FiUserCheck, FiChevronRight, FiCheck, FiX, FiAward, FiGlobe, 
  FiHeart, FiCompass, FiSmile, FiShield 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export const PlannerProfile = () => {
  const { plannerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Selected portfolio category filter
  const [portfolioFilter, setPortfolioFilter] = useState('Royal Weddings');

  // Lightbox zoom state
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Modal triggers
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isHireOpen, setIsHireOpen] = useState(false);

  // Form states
  const [meetingForm, setMeetingForm] = useState({ date: '', time: '', agenda: '', meetingType: 'Google Meet' });
  const [hireForm, setHireForm] = useState({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });

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
      toast.success("Consultation meeting scheduled! Coordinator notified.");
      setIsMeetingOpen(false);
      setMeetingForm({ date: '', time: '', agenda: '', meetingType: 'Google Meet' });
      queryClient.invalidateQueries({ queryKey: ['myPlanner'] });
    },
    onError: (err) => {
      toast.error(err.message || "Error scheduling meeting");
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
      toast.success("Hiring proposal submitted successfully!");
      setIsHireOpen(false);
      setHireForm({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });
    },
    onError: (err) => {
      toast.error(err.message || "Error sending proposal");
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
      <div className="h-[60vh] flex items-center justify-center bg-ivory dark:bg-darkbg">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-rosegold/20 border-t-rosegold dark:border-goldAccent/20 dark:border-t-goldAccent animate-spin" />
          <p className="font-playfair text-xs tracking-widest text-rosegold dark:text-goldAccent uppercase animate-pulse">Curating coordinator profile...</p>
        </div>
      </div>
    );
  }

  if (!planner) {
    return (
      <div className="text-center py-16 bg-ivory dark:bg-darkbg min-h-[60vh] flex flex-col items-center justify-center text-[#5c4033] dark:text-goldAccent">
        <h3 className="text-lg font-bold font-playfair">Planner profile not found</h3>
        <button onClick={() => navigate('/client/planners')} className="mt-4 px-6 py-2 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold rounded text-xs shadow">
          Back to Directory
        </button>
      </div>
    );
  }

  // Portfolio categories mapping
  const portfolioCategories = [
    'Royal Weddings',
    'Beach Weddings',
    'Garden Weddings',
    'Destination Weddings',
    'Traditional Weddings',
    'Reception Events'
  ];

  // Specific photos by category for premium pinterest feel
  const galleryPhotos = {
    'Royal Weddings': [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600",
      "https://images.unsplash.com/photo-1507504038482-7621c5b9e078?q=80&w=600"
    ],
    'Beach Weddings': [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600",
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=600",
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600"
    ],
    'Garden Weddings': [
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600",
      "https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?q=80&w=600",
      "https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=600"
    ],
    'Destination Weddings': [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600"
    ],
    'Traditional Weddings': [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600",
      "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=600",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600"
    ],
    'Reception Events': [
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600",
      "https://images.unsplash.com/photo-1519225495810-7517c300ea97?q=80&w=600"
    ]
  };

  const selectedImages = galleryPhotos[portfolioFilter] || galleryPhotos['Royal Weddings'];

  return (
    <div className="space-y-10 pb-16 font-roboto">
      
      {/* Magazine Banner Cover Header */}
      <div className="relative rounded-3xl overflow-hidden h-[250px] md:h-[350px] border border-rosegold/20 dark:border-goldAccent/15 shadow-md">
        <img 
          src={planner.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200"}
          alt="Wedding Cover"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Soft overlay quote */}
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center select-none">
          <span className="font-playfair text-white text-lg md:text-2xl font-light italic tracking-wider max-w-xl">
            "We design ceremonies that tell your unique love story."
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ================================================= */}
        {/* LEFT COLUMN: ARCH PORTRAIT & SPECIAL DETAILS      */}
        {/* ================================================= */}
        <div className="lg:col-span-4 space-y-8 flex flex-col items-center text-center lg:items-stretch lg:text-left">
          
          {/* Magazine Portrait Overlap Wrapper */}
          <div className="relative w-full max-w-[280px] lg:max-w-none aspect-[4/5] rounded-t-full rounded-b-2xl overflow-hidden border-2 border-rosegold/35 dark:border-goldAccent/35 shadow-lg bg-cream/40 mx-auto -mt-20 lg:-mt-28 z-20">
            <img
              src={planner.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"}
              alt={planner.name?.name || "Wedding Curator"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Brand */}
          <div className="space-y-2 mt-4 text-center">
            <h2 className="text-3xl font-bold font-playfair tracking-wide text-darktext dark:text-goldAccent">
              {planner.name?.name}
            </h2>
            <p className="text-[10px] font-bold tracking-widest text-rosegold dark:text-goldAccent/80 uppercase">
              Elite Wedding Coordinator
            </p>
            <div className="flex items-center justify-center space-x-2 text-[10px] italic text-darktext/60 dark:text-gray-400">
              <span className="h-px bg-rosegold/20 w-8" />
              <span>Curation & Majestic Production</span>
              <span className="h-px bg-rosegold/20 w-8" />
            </div>
          </div>

          {/* Details Table */}
          <div className="w-full border border-rosegold/20 dark:border-goldAccent/15 rounded-3xl bg-cream/25 dark:bg-darkcard/40 p-5 space-y-3 text-xs text-darktext dark:text-gray-300">
            {[
              { label: "Experience", value: planner.exprience || "8+ Years", icon: FiBriefcase },
              { label: "Events Planned", value: `${planner.assignedEvents || '250'} Weddings`, icon: FiCalendar },
              { label: "Specialization", value: planner.specialiazation || "Destination & Royal Banquets", icon: FiStar },
              { label: "HQ Location", value: planner.city || "Udaipur, India", icon: FiMapPin },
              { label: "Availability", value: planner.availabilityStatus || "Available", icon: FiClock }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-start py-2.5 border-b border-rosegold/10 dark:border-goldAccent/10 last:border-0 last:pb-0">
                <span className="font-semibold text-darktext/60 dark:text-gray-400 flex items-center">
                  <item.icon className="mr-2 text-rosegold dark:text-goldAccent w-4 h-4" />
                  {item.label}
                </span>
                <span className="text-right font-bold text-darktext dark:text-white max-w-[180px] font-playfair">{item.value}</span>
              </div>
            ))}
          </div>

          {/* About Bio block */}
          <div className="w-full border border-rosegold/20 dark:border-goldAccent/15 rounded-3xl bg-cream/25 dark:bg-darkcard/40 p-6 space-y-4">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent border-b border-rosegold/10 dark:border-goldAccent/10 pb-2">Philosophy</h4>
            <p className="text-xs leading-relaxed text-darktext/75 dark:text-gray-450 italic">
              "{planner.bio || 'I believe that planning a wedding is about curating details that reflect who you are. With precise design, floral accents, and royal logistics, we construct your grand fairytale.'}"
            </p>
          </div>

        </div>

        {/* ================================================= */}
        {/* RIGHT COLUMN: SPECS, PORTFOLIO MASONRY & REVIEWS  */}
        {/* ================================================= */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Action Header Panel */}
          <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
            <button
              onClick={() => navigate(`/client/chat/${planner.name?._id || planner.userId?._id}`)}
              className="px-6 py-2.5 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow hover:opacity-90 flex items-center space-x-1.5"
            >
              <FiMessageSquare className="w-4 h-4" />
              <span>Chat with Planner</span>
            </button>
            
            <button
              onClick={() => setIsMeetingOpen(true)}
              className="px-6 py-2.5 bg-transparent border border-rosegold dark:border-goldAccent text-rosegold dark:text-goldAccent font-semibold text-xs uppercase tracking-widest rounded hover:bg-rosegold/5 transition-all"
            >
              Book Consultation
            </button>

            <button
              onClick={() => setIsHireOpen(true)}
              className="px-6 py-2.5 bg-[#4A403A] text-white font-semibold text-xs uppercase tracking-widest rounded shadow hover:bg-opacity-95"
            >
              Hire Planner
            </button>
          </div>

          {/* Awards and Honours */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair flex items-center">
                <FiAward className="mr-2" /> Recognition & Specializations
              </h3>
              <div className="h-px bg-rosegold/20 dark:bg-goldAccent/20 w-32 mt-1.5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-rosegold/25 bg-cream/15 dark:bg-darkcard/40 flex items-start space-x-3">
                <div className="text-goldAccent text-lg">✦</div>
                <div>
                  <h4 className="text-xs font-bold text-darktext dark:text-white font-playfair">Best Luxury Planner Award</h4>
                  <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-0.5 leading-relaxed font-light">Honored by the Wedding Curation Forum in 2025 for destination management.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-rosegold/25 bg-cream/15 dark:bg-darkcard/40 flex items-start space-x-3">
                <div className="text-goldAccent text-lg">✦</div>
                <div>
                  <h4 className="text-xs font-bold text-darktext dark:text-white font-playfair">Floral Scenography Specialization</h4>
                  <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-0.5 leading-relaxed font-light">Expertise in architectural floral arches, centerpieces, and traditional garlands.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pinterest-style Masonry Gallery */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-rosegold/20 dark:border-goldAccent/15 pb-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair">
                  Wedding Portfolio
                </h3>
                <p className="text-[9px] text-darktext/50">Large wedding image galleries</p>
              </div>

              {/* Category selector pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {portfolioCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioFilter(cat)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all border ${
                      portfolioFilter === cat
                        ? 'bg-rosegold border-rosegold text-white dark:bg-goldAccent dark:border-goldAccent dark:text-black shadow-sm'
                        : 'bg-white dark:bg-darkcard border-rosegold/20 text-darktext/60 dark:text-gray-400 hover:text-rosegold'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Masonry Layout Grid */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
              {selectedImages.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => setActiveLightbox({ url: imgUrl })}
                  className="break-inside-avoid relative overflow-hidden rounded-2xl border border-rosegold/25 shadow-sm cursor-pointer group bg-cream/10"
                >
                  <img
                    src={imgUrl}
                    alt={`wedding-portfolio-${index}`}
                    className="w-full object-cover group-hover:scale-102 transition-transform duration-500 rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-rosegold/90 dark:bg-goldAccent dark:text-black px-3 py-1.5 rounded-full shadow border border-white/20">
                      Zoom Image
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair">
                Testimonials
              </h3>
              <div className="h-px bg-rosegold/20 w-24 mt-1.5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.length > 0 ? (
                reviews.slice(0, 2).map((rev, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-rosegold/20 bg-cream/10 dark:bg-darkcard/40 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-darktext/75 dark:text-gray-450 italic leading-relaxed">
                      "{rev.text}"
                    </p>
                    <div className="flex items-center space-x-2 pt-2 border-t border-rosegold/10">
                      <div className="w-6 h-6 rounded-full bg-rosegold text-white flex items-center justify-center font-bold text-[10px]">
                        {rev.clientName?.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-darktext dark:text-white font-playfair">{rev.clientName}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-darktext/50 italic col-span-2">No testimonial statements registered yet.</p>
              )}
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
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLightbox(null)}
              className="fixed inset-0 bg-[#1A1513]"
            />
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50"
            >
              <FiX className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] z-10"
            >
              <img
                src={activeLightbox.url}
                alt="Lightbox preview"
                className="rounded-2xl max-w-full max-h-[80vh] object-contain border border-white/10 shadow-2xl"
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
              className="bg-white dark:bg-darkcard w-full max-w-md p-6 sm:p-8 rounded-3xl border border-rosegold/25 dark:border-goldAccent/25 shadow-2xl relative z-10 overflow-hidden text-xs font-semibold text-darktext dark:text-gray-300"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold font-playfair text-darktext dark:text-white uppercase tracking-wider">
                    Schedule Call
                  </h3>
                  <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-1">Book consultation call with {planner.name?.name}</p>
                </div>
                <button onClick={() => setIsMeetingOpen(false)} className="p-1.5 rounded-full hover:bg-cream dark:hover:bg-darkbg text-rosegold dark:text-goldAccent">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Meeting Time</label>
                  <input
                    type="time"
                    required
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Meeting Platform</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Internal Video Call">Internal Video Call</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Agenda</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Brief agenda..."
                    value={meetingForm.agenda}
                    onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={scheduleMeetingMutation.isPending}
                  className="w-full py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow hover:opacity-95"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
              className="bg-white dark:bg-darkcard w-full max-w-md p-6 sm:p-8 rounded-3xl border border-rosegold/25 dark:border-goldAccent/25 shadow-2xl relative z-10 overflow-hidden text-xs font-semibold text-darktext dark:text-gray-300"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold font-playfair text-darktext dark:text-white uppercase tracking-wider">
                    Hire Wedding Planner
                  </h3>
                  <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-1">Submit proposal to {planner.name?.name}</p>
                </div>
                <button onClick={() => setIsHireOpen(false)} className="p-1.5 rounded-full hover:bg-cream dark:hover:bg-darkbg text-rosegold dark:text-goldAccent">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleHireSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Theme / Style</label>
                  <select
                    value={hireForm.weddingType}
                    onChange={(e) => setHireForm({ ...hireForm, weddingType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  >
                    <option value="Royal Wedding">Royal Palace Wedding</option>
                    <option value="Destination Wedding">Destination Wedding</option>
                    <option value="Beach Wedding">Sunset Beach Wedding</option>
                    <option value="Luxury Wedding">Luxury Boutique Wedding</option>
                    <option value="Traditional Wedding">Traditional Heritage Wedding</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Planned Date</label>
                  <input
                    type="date"
                    required
                    value={hireForm.weddingDate}
                    onChange={(e) => setHireForm({ ...hireForm, weddingDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Destination City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur, Goa..."
                    value={hireForm.location}
                    onChange={(e) => setHireForm({ ...hireForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Budget (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7500000"
                    value={hireForm.budget}
                    onChange={(e) => setHireForm({ ...hireForm, budget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Brief Requirements</label>
                  <textarea
                    rows="3"
                    placeholder="Mandate details..."
                    value={hireForm.requirements}
                    onChange={(e) => setHireForm({ ...hireForm, requirements: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={hirePlannerMutation.isPending}
                  className="w-full py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow hover:opacity-95"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
