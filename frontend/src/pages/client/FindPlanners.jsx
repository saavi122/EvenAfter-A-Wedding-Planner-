import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMapPin, FiCalendar, FiMessageSquare, FiBriefcase, FiUserCheck, FiSearch, FiSliders, FiClock, FiX, FiCheck } from 'react-icons/fi';

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

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

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
    onSuccess: (data) => {
      showToast("Meeting scheduled successfully! Planner notified.", "success");
      setIsMeetingOpen(false);
      setMeetingForm({ date: '', time: '', agenda: '', meetingType: 'Google Meet' });
      queryClient.invalidateQueries({ queryKey: ['myPlanner'] });
    },
    onError: (err) => {
      showToast(err.message || "Error scheduling meeting", "error");
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
      showToast("Hiring proposal sent! You can track status in your dashboard.", "success");
      setIsHireOpen(false);
      setHireForm({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });
      queryClient.invalidateQueries({ queryKey: ['plannerRequests'] });
    },
    onError: (err) => {
      showToast(err.message || "Error sending proposal", "error");
    }
  });

  // Extract cities and specializations for filter dropdowns
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

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-5 py-3 rounded-2xl shadow-xl text-white text-xs font-bold border ${
              toast.type === 'success' 
                ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/25' 
                : 'bg-rose-600 border-rose-500 shadow-rose-500/25'
            }`}
          >
            {toast.type === 'success' ? <FiCheck className="w-5 h-5" /> : <FiX className="w-5 h-5" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and intro */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center uppercase tracking-tight">
            <span className="w-3.5 h-3.5 rounded-full bg-accent mr-3" />
            Find Wedding Planners
          </h2>
          <p className="text-xs text-slate-500 mt-1">Connect with premium designers, organizers, and wedding coordinators</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/50 dark:bg-[#0f172a]/40 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-sm">
        
        {/* Search */}
        <div className="md:col-span-6 relative">
          <input
            type="text"
            placeholder="Search by planner name, specialty, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-sm outline-none transition-all focus:border-accent"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500 w-4.5 h-4.5" />
        </div>

        {/* City Filter */}
        <div className="md:col-span-3">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-sm outline-none focus:border-accent capitalize"
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
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-sm outline-none focus:border-accent"
          >
            <option value="All">All Specializations</option>
            {specializations.filter(s => s !== 'All').map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-[40px] border border-slate-250 dark:border-slate-800 p-6 space-y-4 animate-pulse bg-white dark:bg-[#0f172a]">
              <div className="w-full aspect-[4/5] rounded-[30px] bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPlanners.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
          <FiSliders className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-base font-extrabold text-slate-850 dark:text-white">No planners match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try broadening your search query or reset your city and specialization selections.</p>
          <button
            onClick={() => { setSearch(''); setCityFilter('All'); setSpecialFilter('All'); }}
            className="mt-6 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Grid of Planners */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlanners.map((planner) => (
            <motion.div
              key={planner._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="glass-card border border-slate-200/50 dark:border-slate-800/50 rounded-[40px] p-5 shadow-lg flex flex-col justify-between hover:shadow-xl hover:border-accent/35 transition-all duration-300 relative group"
            >
              
              {/* Arched Photo Wrapper */}
              <div className="relative w-full aspect-[4/5] rounded-[30px] rounded-t-[100px] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
                <img
                  src={planner.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"}
                  alt={planner.name?.name || "Planner"}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-[10px] font-bold text-accent tracking-wider uppercase bg-white/90 backdrop-blur px-2.5 py-1 rounded-full self-start shadow border border-white/20 mb-3">
                    {planner.specialiazation?.split('&')[0]}
                  </span>
                  
                  <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                    {planner.name?.name}
                  </h3>
                  
                  <p className="text-xs text-slate-350 font-medium truncate mt-0.5">
                    {planner.companyName}
                  </p>
                </div>

                {/* Rating badge */}
                <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-full bg-white/95 dark:bg-[#0f172a]/95 text-amber-500 font-extrabold text-[10px] shadow border border-slate-200/50 dark:border-slate-800/50">
                  <FiStar className="fill-current w-3.5 h-3.5" />
                  <span>{planner.ratings?.toFixed(1) || '5.0'}</span>
                </div>

                {/* Availability Badge */}
                <div className={`absolute top-4 left-4 flex items-center space-x-1 px-3 py-1 rounded-full text-white font-extrabold text-[9px] shadow ${
                  planner.availabilityStatus === 'Available' ? 'bg-emerald-500/85' : 'bg-amber-500/85'
                }`}>
                  <FiClock className="w-3.5 h-3.5" />
                  <span>{planner.availabilityStatus}</span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="py-4 space-y-4 flex-1 flex flex-col justify-between">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10.5px] text-slate-500 font-semibold">
                    <span className="flex items-center">
                      <FiMapPin className="mr-1 text-accent" />
                      {planner.city}
                    </span>
                    <span>{planner.exprience} Experience</span>
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-3 leading-relaxed italic">
                    "{planner.bio}"
                  </p>
                </div>

                {/* Mini stats */}
                <div className="flex justify-between items-center border-t border-b border-slate-200/40 dark:border-slate-800/40 py-2.5 text-[10px] font-bold text-slate-650 dark:text-slate-350">
                  <span className="flex items-center">
                    <FiBriefcase className="mr-1 text-accent" />
                    {planner.assignedEvents} Weddings Handled
                  </span>
                </div>

                {/* Grid Buttons */}
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  
                  {/* View Profile */}
                  <button
                    onClick={() => navigate(`/client/planners/${planner._id}`)}
                    className="py-2.5 border border-slate-200 hover:border-accent hover:text-accent dark:border-slate-800 text-[10px] font-bold rounded-xl transition-all"
                  >
                    View Profile
                  </button>

                  {/* Schedule Meeting */}
                  <button
                    onClick={() => { setSelectedPlanner(planner); setIsMeetingOpen(true); }}
                    className="py-2.5 border border-slate-200 hover:border-accent hover:text-accent dark:border-slate-800 text-[10px] font-bold rounded-xl transition-all"
                  >
                    Schedule Meeting
                  </button>

                  {/* Direct Chat */}
                  <button
                    onClick={() => navigate(`/client/chat/${planner.name?._id || planner.userId?._id}`)}
                    className="py-2.5 border border-slate-200 hover:border-accent hover:text-accent dark:border-slate-800 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5"
                  >
                    <FiMessageSquare className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>

                  {/* Hire Planner */}
                  <button
                    onClick={() => { setSelectedPlanner(planner); setIsHireOpen(true); }}
                    className="py-2.5 bg-gradient-to-r from-accent/90 to-primary/90 text-white hover:scale-[1.02] text-[10px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <FiUserCheck className="w-3.5 h-3.5" />
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
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMeetingOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 overflow-hidden"
            >
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                    Schedule Video Meeting
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Book a consultation with {selectedPlanner.name?.name}</p>
                </div>
                <button
                  onClick={() => setIsMeetingOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMeetingSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                
                {/* Date */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Meeting Time</label>
                  <input
                    type="time"
                    required
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Meeting Type */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Meeting Platform</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Internal Video Call">Internal Video Call</option>
                  </select>
                </div>

                {/* Agenda */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Agenda / Discussion details</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Budget alignment, venue ideas, floral layout..."
                    value={meetingForm.agenda}
                    onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={scheduleMeetingMutation.isPending}
                  className="w-full py-3.5 bg-gradient-to-r from-accent to-primary text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHireOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 overflow-hidden"
            >
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                    Hire Wedding Planner
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Submit proposal brief to {selectedPlanner.name?.name}</p>
                </div>
                <button
                  onClick={() => setIsHireOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleHireSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                
                {/* Wedding Type */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Wedding Theme / Style</label>
                  <select
                    value={hireForm.weddingType}
                    onChange={(e) => setHireForm({ ...hireForm, weddingType: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Royal Wedding">Royal Palace Wedding</option>
                    <option value="Destination Wedding">Destination Wedding</option>
                    <option value="Beach Wedding">Sunset Beach Wedding</option>
                    <option value="Luxury Wedding">Luxury Boutique Wedding</option>
                    <option value="Traditional Wedding">Traditional Heritage Wedding</option>
                    <option value="Garden Wedding">Chic Garden Wedding</option>
                  </select>
                </div>

                {/* Wedding Date */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Planned Wedding Date</label>
                  <input
                    type="date"
                    required
                    value={hireForm.weddingDate}
                    onChange={(e) => setHireForm({ ...hireForm, weddingDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Wedding Destination / City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur, Jodhpur, Goa, Bali..."
                    value={hireForm.location}
                    onChange={(e) => setHireForm({ ...hireForm, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Overall Budget (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000000"
                    value={hireForm.budget}
                    onChange={(e) => setHireForm({ ...hireForm, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Special Requirements / Mandates</label>
                  <textarea
                    rows="3"
                    placeholder="Describe guest count estimate, decor color palette (e.g. rose gold theme), food preferences, timeline urgency..."
                    value={hireForm.requirements}
                    onChange={(e) => setHireForm({ ...hireForm, requirements: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={hirePlannerMutation.isPending}
                  className="w-full py-3.5 bg-gradient-to-r from-accent to-primary text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
