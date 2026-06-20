import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  FiCheck, FiX, FiCalendar, FiMessageSquare, FiUsers, FiClock, 
  FiActivity, FiMapPin, FiBriefcase, FiDollarSign, FiTrash2, FiStar 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export const VendorDashboard = () => {
  const { user, profile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vendorTab, setVendorTab] = useState('Overview');

  // Services form state
  const [newService, setNewService] = useState('');
  
  // Portfolio form state
  const [newMediaUrl, setNewMediaUrl] = useState('');

  // 1. Fetch Vendor's Assignments (assignments sent by Planners)
  const { data: assignmentsResponse, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['vendorAssignments'],
    queryFn: async () => {
      const res = await fetch('/api/vendor-assignments/vendor');
      if (!res.ok) throw new Error('Failed to load assignments');
      return res.json();
    }
  });

  const assignments = assignmentsResponse?.data || [];
  const pendingRequests = assignments.filter(a => a.status === 'Pending');
  const activeWeddings = assignments.filter(a => a.status === 'Accepted');

  // Compute total revenue from accepted jobs
  const totalRevenue = activeWeddings.reduce((acc, curr) => acc + (curr.budget || 0), 0);

  // Extract unique connected planners from assignments
  const connectedPlanners = [];
  const seenPlannerIds = new Set();
  for (const a of assignments) {
    const planner = a.plannerId;
    if (planner && !seenPlannerIds.has(planner._id)) {
      seenPlannerIds.add(planner._id);
      connectedPlanners.push(planner);
    }
  }

  // 2. Setup Socket.io real-time listener for incoming assignments
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socket.emit("join", user._id);

    socket.on("notification", (notif) => {
      if (notif.type === "assignment") {
        toast.success(notif.message);
        queryClient.invalidateQueries({ queryKey: ['vendorAssignments'] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, queryClient]);

  // Mutation to update assignment status (Accept / Reject)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ assignmentId, status }) => {
      const res = await fetch(`/api/vendor-assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to update assignment');
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Assignment ${variables.status.toLowerCase()}ed successfully!`);
      queryClient.invalidateQueries({ queryKey: ['vendorAssignments'] });
    },
    onError: (err) => {
      toast.error(err.message || "Error updating assignment");
    }
  });

  // Mutation to update vendor availability status & services/portfolio
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedFields) => {
      const res = await fetch(`/api/vendors/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to update profile');
      return result.data;
    },
    onSuccess: () => {
      toast.success("Profile/Status updated successfully!");
      refreshUser(); // Refresh global auth status
    },
    onError: (err) => {
      toast.error(err.message || "Error updating status");
    }
  });

  const handleUpdateStatus = (assignmentId, status) => {
    updateStatusMutation.mutate({ assignmentId, status });
  };

  const handleAvailabilityChange = (e) => {
    updateProfileMutation.mutate({ availabilityStatus: e.target.value });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newService.trim()) return;
    const currentServices = profile?.servicesOffered || [];
    if (currentServices.includes(newService)) {
      toast.error("Service is already added");
      return;
    }
    updateProfileMutation.mutate({
      servicesOffered: [...currentServices, newService]
    });
    setNewService('');
  };

  const handleRemoveService = (serviceToRemove) => {
    const currentServices = profile?.servicesOffered || [];
    updateProfileMutation.mutate({
      servicesOffered: currentServices.filter(s => s !== serviceToRemove)
    });
  };

  const handleAddPortfolioUrl = (e) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;
    const currentPortfolio = profile?.portfolio || [];
    if (currentPortfolio.includes(newMediaUrl)) {
      toast.error("Media URL is already in your portfolio");
      return;
    }
    updateProfileMutation.mutate({
      portfolio: [...currentPortfolio, newMediaUrl]
    });
    setNewMediaUrl('');
  };

  const handleRemovePortfolioUrl = (urlToRemove) => {
    const currentPortfolio = profile?.portfolio || [];
    updateProfileMutation.mutate({
      portfolio: currentPortfolio.filter(u => u !== urlToRemove)
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-16 font-roboto"
    >
      
      {/* Wedding Cover Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/35 dark:bg-darkcard p-6 md:p-8 shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 dark:opacity-5 pointer-events-none select-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-rosegold dark:text-goldAccent w-full h-full">
            <path d="M50 0 C40 20 20 40 0 50 C20 60 40 80 50 100 C60 80 80 60 100 50 C80 40 60 20 50 0 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-rosegold dark:text-goldAccent uppercase block mb-1">
              Vendor Suite
            </span>
            <h2 className="text-3xl font-playfair font-semibold text-darktext dark:text-white tracking-wide">
              {profile?.businessName || user?.name}
            </h2>
            <p className="font-playfair italic text-xs text-darktext/70 dark:text-gray-400 mt-2 max-w-xl font-light">
              "Providing curated wedding layouts, beautiful florals, and logistics coordination for our premium event planners."
            </p>
          </div>

          {/* Availability Status switcher */}
          <div className="bg-white/50 dark:bg-black/35 backdrop-blur-md p-4 rounded-2xl border border-rosegold/20 dark:border-goldAccent/20 flex flex-col space-y-1.5 self-start md:self-auto min-w-[200px] shadow-sm">
            <span className="text-[9px] font-bold text-rosegold dark:text-goldAccent uppercase tracking-widest block font-bold">Registry Availability</span>
            <select
              value={profile?.availabilityStatus || "Available"}
              onChange={handleAvailabilityChange}
              className="px-3 py-2 bg-cream/30 dark:bg-darkbg border border-rosegold/20 dark:border-goldAccent/25 rounded-xl text-xs font-bold outline-none text-darktext dark:text-white focus:border-rosegold dark:focus:border-goldAccent"
            >
              <option value="Available">Available (Accepting Requests)</option>
              <option value="Busy">Busy (Limited Slots)</option>
              <option value="Booked">Booked (Fully Reserved)</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-rosegold/20 dark:border-goldAccent/15 pb-2">
        {['Overview', 'Services & Packages', 'Portfolio Showcase', 'Calendar & Revenue', 'Reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setVendorTab(tab)}
            className={`px-4 py-2 rounded-t-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 border-t border-x border-transparent -mb-2 ${
              vendorTab === tab 
                ? 'bg-cream/45 dark:bg-darkcard text-rosegold dark:text-goldAccent border-rosegold/25 dark:border-goldAccent/25 font-playfair' 
                : 'text-darktext/70 dark:text-gray-400 hover:text-rosegold dark:hover:text-goldAccent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={vendorTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm"
        >
          {/* OVERVIEW TAB */}
          {vendorTab === 'Overview' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Assigned Weddings', val: activeWeddings.length, label: 'Active Weddings Handled', icon: FiBriefcase },
                  { name: 'Connected Planners', val: connectedPlanners.length, label: 'Active Coordinators', icon: FiUsers },
                  { name: 'Incoming Requests', val: pendingRequests.length, label: 'Needs Action', icon: FiClock },
                  { name: 'Completed Ceremonies', val: profile?.completedEvents || 0, label: 'Lifetime Handled', icon: FiActivity }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-rosegold/15 text-rosegold dark:bg-goldAccent/15 dark:text-goldAccent flex-shrink-0">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-darktext/50 dark:text-gray-400">{stat.name}</p>
                      <h3 className="text-xl font-bold font-playfair text-darktext dark:text-white mt-0.5">{stat.val}</h3>
                      <p className="text-[10px] text-rosegold dark:text-goldAccent/80 font-semibold">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Roster & requests */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Proposals and client assignments */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Incoming requests */}
                  <div className="p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair flex items-center">
                      <span className="w-2 h-2 rounded-full bg-rosegold dark:bg-goldAccent mr-2" />
                      Incoming Job Assignments ({pendingRequests.length})
                    </h3>
                    {assignmentsLoading && <p className="text-xs text-darktext/50 py-4 text-center">Loading briefs...</p>}
                    {!assignmentsLoading && pendingRequests.length === 0 && (
                      <p className="text-xs text-darktext/50 py-4 text-center font-light">No pending assignments at this time.</p>
                    )}
                    {!assignmentsLoading && pendingRequests.map((assign) => (
                      <div key={assign._id} className="p-4 rounded-xl bg-white/70 dark:bg-black/25 border border-rosegold/15 dark:border-goldAccent/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-darktext dark:text-white font-playfair">Event: {assign.weddingId?.title || " Sarah's Wedding"}</span>
                            <span className="text-[8px] bg-rosegold/15 text-rosegold dark:bg-goldAccent/10 dark:text-goldAccent px-2 py-0.5 rounded font-bold uppercase tracking-wider">{assign.role}</span>
                          </div>
                          <p className="text-darktext/60 dark:text-gray-400"><FiMapPin className="inline mr-1 text-rosegold dark:text-goldAccent w-3.5 h-3.5" />{assign.weddingId?.venue} • Date: {new Date(assign.date).toLocaleDateString()} • Offer: {assign.budget?.toLocaleString()} INR</p>
                        </div>
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                          <button
                            onClick={() => handleUpdateStatus(assign._id, "Accepted")}
                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center space-x-1"
                          >
                            <FiCheck className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(assign._id, "Rejected")}
                            className="flex-1 md:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center justify-center space-x-1"
                          >
                            <FiX className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Connected planners */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4 text-xs">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent">Connected Planners</h4>
                    
                    <div className="space-y-3">
                      {connectedPlanners.map((p) => (
                        <div 
                          key={p._id} 
                          onClick={() => navigate(`/vendor/chat/${p.name?._id || p.userId?._id}`)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-rosegold/10 cursor-pointer border border-transparent hover:border-rosegold/10 transition-all"
                        >
                          <div className="flex items-center space-x-2.5">
                            <img src={p.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <h5 className="font-bold text-darktext dark:text-white truncate max-w-[120px] font-playfair">{p.companyName}</h5>
                              <span className="text-[9px] text-darktext/50">{p.city}</span>
                            </div>
                          </div>
                          <FiMessageSquare className="w-3.5 h-3.5 text-rosegold dark:text-goldAccent" />
                        </div>
                      ))}
                      {connectedPlanners.length === 0 && (
                        <p className="text-xs text-darktext/50 py-2">No connected coordinators yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SERVICES TAB */}
          {vendorTab === 'Services & Packages' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-semibold">
              {/* Add form */}
              <div className="lg:col-span-5 p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent">Add Service Offered</h4>
                <form onSubmit={handleAddService} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Service Title</label>
                    <input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      required
                      placeholder="e.g. Traditional Garland Curation"
                      className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-rosegold dark:bg-goldAccent hover:bg-rosegold/90 dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded"
                  >
                    Add Service
                  </button>
                </form>
              </div>

              {/* Services list */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10">Offerings Registry</h4>
                <div className="space-y-2.5">
                  {profile?.servicesOffered?.map((s, idx) => (
                    <div key={idx} className="p-3 bg-white/50 dark:bg-black/20 border border-rosegold/10 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-bold text-darktext dark:text-white font-playfair">{s}</span>
                      <button
                        onClick={() => handleRemoveService(s)}
                        className="text-rose-500 p-1 hover:bg-rose-500/10 rounded"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!profile?.servicesOffered || profile.servicesOffered.length === 0) && (
                    <p className="text-xs text-darktext/50 text-center py-4">No services configured on your profile.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PORTFOLIO TAB */}
          {vendorTab === 'Portfolio Showcase' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-semibold">
              {/* Add form */}
              <div className="lg:col-span-5 p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent">Append Portfolio Link</h4>
                <form onSubmit={handleAddPortfolioUrl} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Image URL</label>
                    <input
                      type="text"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      required
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-rosegold dark:bg-goldAccent hover:bg-rosegold/90 dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded"
                  >
                    Add Portfolio Media
                  </button>
                </form>
              </div>

              {/* Showcase items list */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10">Showcase Gallery</h4>
                <div className="grid grid-cols-3 gap-3">
                  {profile?.portfolio?.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-rosegold/10 group shadow-sm bg-cream">
                      <img src={url} alt="Portfolio Work" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2 items-start">
                        <button
                          onClick={() => handleRemovePortfolioUrl(url)}
                          className="p-1 bg-rose-500 rounded text-white hover:bg-rose-600 shadow"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!profile?.portfolio || profile.portfolio.length === 0) && (
                    <p className="text-xs text-darktext/50 col-span-3 text-center py-4">No portfolio images uploaded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR & REVENUE TAB */}
          {vendorTab === 'Calendar & Revenue' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-semibold">
              {/* Revenue metrics cards */}
              <div className="lg:col-span-4 p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Platform Revenue Earned</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <FiDollarSign className="w-6 h-6 text-rosegold dark:text-goldAccent" />
                    <span className="text-2xl font-bold font-playfair text-darktext dark:text-white">{totalRevenue.toLocaleString()} INR</span>
                  </div>
                </div>
                <p className="text-[10px] text-darktext/55 font-light">Calculated sum from accepted planner agreements.</p>
              </div>

              {/* Booked dates calendar roster */}
              <div className="lg:col-span-8 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10">Availability Calendar</h4>
                <div className="space-y-2.5">
                  {activeWeddings.map((assign) => (
                    <div key={assign._id} className="p-3 bg-white/70 dark:bg-black/25 border border-rosegold/10 dark:border-goldAccent/10 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-bold text-darktext dark:text-white font-playfair">Event: {assign.weddingId?.title || "Sarah's Wedding"}</h5>
                        <p className="text-darktext/50 mt-1">Role: {assign.role} • {assign.weddingId?.venue || 'Umaid Bhawan Jodhpur'}</p>
                      </div>
                      <span className="px-3 py-1 bg-rosegold/10 border border-rosegold/20 text-rosegold rounded-full font-bold text-[9px]">
                        Date: {new Date(assign.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {activeWeddings.length === 0 && (
                    <p className="text-xs text-darktext/50 py-4 text-center">No upcoming booked calendar dates found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {vendorTab === 'Reviews' && (
            <div className="space-y-4 text-xs font-semibold">
              <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 font-playfair">Client Reviews</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sarah & David', rating: 5, text: 'Absolutely spectacular service! Exceeded all floral backdrop expectations.', date: 'Dec 2025' },
                  { name: 'Rohan & Neha', rating: 5, text: 'Highly professional, great coordination and response times.', date: 'Feb 2026' }
                ].map((rev, idx) => (
                  <div key={idx} className="p-4 bg-white/70 dark:bg-black/25 border border-rosegold/10 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-darktext dark:text-white font-playfair">{rev.name}</h4>
                      <div className="flex items-center space-x-0.5 text-goldAccent font-bold">
                        <FiStar className="fill-current w-3.5 h-3.5" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-darktext/75 dark:text-gray-400 italic font-light">"{rev.text}"</p>
                    <span className="text-[9px] text-darktext/50 block mt-2 text-right">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
};

export default VendorDashboard;
