import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, FiMapPin, FiCalendar, FiMessageSquare, FiBriefcase, 
  FiUserCheck, FiSearch, FiSliders, FiClock, FiX, FiCheck, FiImage 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export const FindPlanners = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [specialFilter, setSpecialFilter] = useState('All');

  // Modals state
  const [selectedPlanner, setSelectedPlanner] = useState(null);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isHireOpen, setIsHireOpen] = useState(false);

  // Form states
  const [meetingForm, setMeetingForm] = useState({ date: '', time: '', agenda: '', meetingType: 'Google Meet' });
  const [hireForm, setHireForm] = useState({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });

  // 1. Fetch Planners from API
  const { data: plannersResponse, isLoading, error } = useQuery({
    queryKey: ['planners'],
    queryFn: async () => {
      const res = await fetch('/api/planners');
      if (!res.ok) throw new Error('Failed to load planners');
      return res.json();
    }
  });

  const planners = plannersResponse?.data || [];

  // 2. Schedule Meeting Mutation
  const scheduleMeetingMutation = useMutation({
    mutationFn: async (meetingData) => {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meetingData, plannerId: selectedPlanner._id })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to book meeting');
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

  // 3. Hire Planner Mutation
  const hirePlannerMutation = useMutation({
    mutationFn: async (requestData) => {
      const res = await fetch('/api/planner-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestData, plannerId: selectedPlanner._id })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to send request');
      return result;
    },
    onSuccess: () => {
      toast.success("Hiring proposal sent! Plan details registered.");
      setIsHireOpen(false);
      setHireForm({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });
      queryClient.invalidateQueries({ queryKey: ['plannerRequests'] });
    },
    onError: (err) => {
      toast.error(err.message || "Error sending proposal");
    }
  });

  // Extract cities and specializations
  const cities = ['All', ...new Set(planners.map(p => p.city).filter(Boolean))];
  const specializations = [
    'All',
    'Royal Palaces & Destination Weddings',
    'Beachside Luxury & Coastal Weddings',
    'Traditional Heritage & Royal Banquets',
    'Luxury Weddings'
  ];

  // Filtering Logic
  const filteredPlanners = planners.filter(planner => {
    const matchesSearch = planner.name?.name?.toLowerCase().includes(search.toLowerCase()) ||
      planner.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      planner.specialiazation?.toLowerCase().includes(search.toLowerCase());

    const matchesCity = cityFilter === 'All' || planner.city === cityFilter;
    
    const matchesSpecial = specialFilter === 'All' || 
      planner.specialiazation?.toLowerCase().includes(specialFilter.toLowerCase()) || 
      (planner.categoriesHandled && planner.categoriesHandled.some(c => c.toLowerCase() === specialFilter.toLowerCase()));

    return matchesSearch && matchesCity && matchesSpecial;
  });

  const handleMeetingSubmit = (e) => {
    e.preventDefault();
    scheduleMeetingMutation.mutate(meetingForm);
  };

  const handleHireSubmit = (e) => {
    e.preventDefault();
    hirePlannerMutation.mutate(hireForm);
  };

  // Pinterest-style placeholder previews if empty
  const defaultPortfolio = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=150",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=150",
    "https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=150"
  ];

  return (
    <div className="space-y-8 pb-16 font-roboto">
      
      {/* Page Header */}
      <div>
        <span className="text-[10px] font-bold tracking-widest text-rosegold dark:text-goldAccent uppercase block mb-1">
          Registry Collection
        </span>
        <h2 className="text-3xl font-playfair font-semibold text-darktext dark:text-white tracking-wide">
          Explore Wedding Curators
        </h2>
        <p className="text-xs text-darktext/60 dark:text-gray-400 mt-1 max-w-xl font-light">
          Immerse yourself in our premium catalog of verified destination coordinators, traditional banqueting experts, and floral stylists.
        </p>
      </div>

      {/* Elegant Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-cream/35 dark:bg-darkcard/40 p-4 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 backdrop-blur-md shadow-sm">
        
        {/* Search */}
        <div className="md:col-span-6 relative">
          <input
            type="text"
            placeholder="Search by planner name, specialty, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 text-xs outline-none transition-all focus:border-rosegold dark:focus:border-goldAccent text-darktext dark:text-white"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rosegold dark:text-goldAccent/70 w-4 h-4" />
        </div>

        {/* City Filter */}
        <div className="md:col-span-3">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 text-xs outline-none focus:border-rosegold dark:focus:border-goldAccent text-darktext dark:text-white capitalize"
          >
            <option value="All">All Locations</option>
            {cities.filter(c => c !== 'All').map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Specialty Filter */}
        <div className="md:col-span-3">
          <select
            value={specialFilter}
            onChange={(e) => setSpecialFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 text-xs outline-none focus:border-rosegold dark:focus:border-goldAccent text-darktext dark:text-white"
          >
            <option value="All">All Specializations</option>
            {specializations.filter(s => s !== 'All').map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Loading view */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-3xl border border-rosegold/10 dark:border-goldAccent/10 p-5 space-y-4 animate-pulse bg-cream/10 dark:bg-darkcard/20">
              <div className="w-full aspect-[4/5] rounded-2xl bg-cream/40 dark:bg-black/20" />
              <div className="h-4 bg-cream/40 dark:bg-black/20 rounded w-2/3" />
              <div className="h-3 bg-cream/40 dark:bg-black/20 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPlanners.length === 0 && (
        <div className="text-center py-16 luxury-card rounded-3xl border border-rosegold/25 dark:border-goldAccent/25">
          <FiSliders className="w-12 h-12 text-rosegold dark:text-goldAccent/75 mx-auto mb-4" />
          <h3 className="text-base font-bold font-playfair text-darktext dark:text-white">No planners match your filters</h3>
          <p className="text-xs text-darktext/60 dark:text-gray-400 mt-1 max-w-sm mx-auto font-light">Try broadening your search query or reset your city and specialization selections.</p>
          <button
            onClick={() => { setSearch(''); setCityFilter('All'); setSpecialFilter('All'); }}
            className="mt-6 px-6 py-2 bg-rosegold dark:bg-goldAccent text-white dark:text-black text-xs font-semibold uppercase tracking-wider rounded shadow-sm hover:opacity-90"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Grid of Luxury Planner Catalog */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlanners.map((planner) => (
            <motion.div
              key={planner._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="luxury-card border border-rosegold/20 dark:border-goldAccent/15 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-rosegold/40 dark:hover:border-goldAccent/30 hover:scale-[1.01] transition-all duration-300 relative group"
            >
              
              {/* Cover image & profile overlay */}
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-rosegold/10 dark:border-goldAccent/10 shadow-inner">
                <img
                  src={planner.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
                  alt="Wedding Event Cover"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5" />

                {/* Profile photo overlapping catalog cover */}
                <div className="absolute bottom-5 left-5 flex items-center space-x-3.5 z-10">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rosegold/40 dark:border-goldAccent/45 bg-cream">
                    <img
                      src={planner.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"}
                      alt={planner.name?.name || "Planner"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-playfair leading-none">
                      {planner.name?.name}
                    </h3>
                    <p className="text-[10px] text-gray-305 tracking-wider font-light mt-1 uppercase">
                      {planner.companyName}
                    </p>
                  </div>
                </div>

                {/* Rating badge */}
                <div className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-1 rounded bg-white/95 dark:bg-darkcard/95 text-amber-500 font-extrabold text-[9px] shadow border border-rosegold/20 dark:border-goldAccent/20">
                  <FiStar className="fill-current w-3 h-3 text-goldAccent" />
                  <span className="text-darktext dark:text-white font-bold">{planner.ratings?.toFixed(1) || '5.0'}</span>
                </div>

                {/* Availability Badge */}
                <div className={`absolute top-4 left-4 flex items-center space-x-1 px-2.5 py-1 rounded text-white font-bold text-[9px] shadow ${
                  planner.availabilityStatus === 'Available' ? 'bg-emerald-600/90' : 'bg-amber-600/90'
                }`}>
                  <FiClock className="w-3 h-3" />
                  <span>{planner.availabilityStatus}</span>
                </div>
              </div>

              {/* Bio, Portfolio Previews, and Actions */}
              <div className="py-4 space-y-4 flex-1 flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-darktext/60 dark:text-gray-400 font-semibold tracking-wider uppercase">
                    <span className="flex items-center">
                      <FiMapPin className="mr-1 text-rosegold dark:text-goldAccent" />
                      {planner.city}
                    </span>
                    <span>{planner.exprience} Experience</span>
                  </div>

                  <p className="text-[11px] text-darktext/75 dark:text-gray-400 line-clamp-2 leading-relaxed italic">
                    "{planner.bio || "Crafting grand luxury celebrations bespoke to your fairytale style."}"
                  </p>

                  {/* Portfolio Preview circles */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-rosegold dark:text-goldAccent block font-bold">Portfolio Previews</span>
                    <div className="flex space-x-2">
                      {(planner.portfolioPreview || defaultPortfolio).slice(0, 3).map((imgUrl, i) => (
                        <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border border-rosegold/20 dark:border-goldAccent/20">
                          <img src={imgUrl} alt="past wedding preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wedding Categories */}
                <div className="flex flex-wrap gap-1 pb-1">
                  {(planner.categoriesHandled || [planner.specialiazation?.split('&')[0] || 'Luxury Wedding']).map((cat, i) => (
                    <span key={i} className="text-[8px] tracking-wider uppercase font-bold text-rosegold dark:text-goldAccent border border-rosegold/30 dark:border-goldAccent/30 bg-cream/10 px-2 py-0.5 rounded">
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Mini stats */}
                <div className="flex justify-between items-center border-t border-rosegold/15 dark:border-goldAccent/10 pt-3 text-[10px] font-semibold text-darktext/75 dark:text-gray-400">
                  <span className="flex items-center">
                    <FiBriefcase className="mr-1 text-rosegold dark:text-goldAccent" />
                    {planner.assignedEvents} weddings planned
                  </span>
                </div>

                {/* Grid Buttons */}
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  
                  <button
                    onClick={() => navigate(`/client/planners/${planner._id}`)}
                    className="py-2 border border-rosegold/30 hover:border-rosegold dark:border-goldAccent/30 dark:hover:border-goldAccent hover:bg-rosegold/5 text-[9px] font-bold uppercase tracking-wider rounded transition-all text-darktext dark:text-gray-300"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => { setSelectedPlanner(planner); setIsMeetingOpen(true); }}
                    className="py-2 border border-rosegold/30 hover:border-rosegold dark:border-goldAccent/30 dark:hover:border-goldAccent hover:bg-rosegold/5 text-[9px] font-bold uppercase tracking-wider rounded transition-all text-darktext dark:text-gray-300"
                  >
                    Schedule Meeting
                  </button>

                  <button
                    onClick={() => navigate(`/client/chat/${planner.name?._id || planner.userId?._id}`)}
                    className="py-2 border border-rosegold/30 hover:border-rosegold dark:border-goldAccent/30 dark:hover:border-goldAccent hover:bg-rosegold/5 text-[9px] font-bold uppercase tracking-wider rounded transition-all text-darktext dark:text-gray-300 flex items-center justify-center space-x-1"
                  >
                    <FiMessageSquare className="w-3 h-3 text-rosegold dark:text-goldAccent" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => { setSelectedPlanner(planner); setIsHireOpen(true); }}
                    className="py-2 bg-rosegold dark:bg-goldAccent text-white dark:text-black text-[9px] font-bold uppercase tracking-wider rounded transition-all hover:scale-[1.01] flex items-center justify-center space-x-1"
                  >
                    <FiUserCheck className="w-3 h-3" />
                    <span>Hire Planner</span>
                  </button>

                </div>

              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      <AnimatePresence>
        {isMeetingOpen && selectedPlanner && (
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
              className="bg-white dark:bg-darkcard w-full max-w-md p-6 sm:p-8 rounded-3xl border border-rosegold/25 dark:border-goldAccent/25 shadow-2xl relative z-10 overflow-hidden"
            >
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold font-playfair text-darktext dark:text-white uppercase tracking-wider">
                    Schedule Video Meeting
                  </h3>
                  <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-1">Book a consultation with {selectedPlanner.name?.name}</p>
                </div>
                <button
                  onClick={() => setIsMeetingOpen(false)}
                  className="p-1.5 rounded-full hover:bg-cream dark:hover:bg-darkbg text-rosegold dark:text-goldAccent"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMeetingSubmit} className="space-y-4 text-xs font-semibold text-darktext dark:text-gray-300">
                
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Meeting Time</label>
                  <input
                    type="time"
                    required
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Meeting Platform</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Internal Video Call">Internal Video Call</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Agenda</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Budget alignment, venue ideas..."
                    value={meetingForm.agenda}
                    onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={scheduleMeetingMutation.isPending}
                  className="w-full py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow hover:opacity-95"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span>{scheduleMeetingMutation.isPending ? 'Booking Meeting...' : 'Book Video Consultation'}</span>
                </motion.button>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HIRE PLANNER MODAL */}
      <AnimatePresence>
        {isHireOpen && selectedPlanner && (
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
              className="bg-white dark:bg-darkcard w-full max-w-md p-6 sm:p-8 rounded-3xl border border-rosegold/25 dark:border-goldAccent/25 shadow-2xl relative z-10 overflow-hidden"
            >
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold font-playfair text-darktext dark:text-white uppercase tracking-wider">
                    Hire Wedding Planner
                  </h3>
                  <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-1">Submit proposal brief to {selectedPlanner.name?.name}</p>
                </div>
                <button
                  onClick={() => setIsHireOpen(false)}
                  className="p-1.5 rounded-full hover:bg-cream dark:hover:bg-darkbg text-rosegold dark:text-goldAccent"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleHireSubmit} className="space-y-4 text-xs font-semibold text-darktext dark:text-gray-300">
                
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Wedding Style</label>
                  <select
                    value={hireForm.weddingType}
                    onChange={(e) => setHireForm({ ...hireForm, weddingType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  >
                    <option value="Royal Wedding">Royal Palace Wedding</option>
                    <option value="Destination Wedding">Destination Wedding</option>
                    <option value="Beach Wedding">Sunset Beach Wedding</option>
                    <option value="Luxury Wedding">Luxury Boutique Wedding</option>
                    <option value="Traditional Wedding">Traditional Heritage Wedding</option>
                    <option value="Garden Wedding">Chic Garden Wedding</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Planned Wedding Date</label>
                  <input
                    type="date"
                    required
                    value={hireForm.weddingDate}
                    onChange={(e) => setHireForm({ ...hireForm, weddingDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Wedding Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur, Goa..."
                    value={hireForm.location}
                    onChange={(e) => setHireForm({ ...hireForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Budget (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000000"
                    value={hireForm.budget}
                    onChange={(e) => setHireForm({ ...hireForm, budget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/70 dark:text-gray-450">Mandates</label>
                  <textarea
                    rows="3"
                    placeholder="Describe guest count, mandates..."
                    value={hireForm.requirements}
                    onChange={(e) => setHireForm({ ...hireForm, requirements: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/20 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={hirePlannerMutation.isPending}
                  className="w-full py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow hover:opacity-95"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span>{hirePlannerMutation.isPending ? 'Sending Brief...' : 'Send Hiring Proposal'}</span>
                </motion.button>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FindPlanners;
