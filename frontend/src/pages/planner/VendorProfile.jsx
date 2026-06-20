import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMapPin, FiCalendar, FiMessageSquare, FiX, FiCheck, FiMail, FiPhone, FiInfo, FiHeart, FiBriefcase, FiCompass, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const VendorProfile = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('portfolio');
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    weddingId: '',
    role: 'Florist',
    budget: '',
    date: ''
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  // 1. Fetch Vendor Details (contains vendor, reviews, previousEvents)
  const { data: vendorResponse, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendorProfile', vendorId],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${vendorId}`);
      if (!res.ok) throw new Error('Failed to load vendor profile');
      return res.json();
    }
  });

  const vendorData = vendorResponse?.data;
  const vendor = vendorData?.vendor;
  const reviews = vendorData?.reviews || [];
  const previousEvents = vendorData?.previousEvents || [];

  // 2. Fetch Hired Clients for Assignment Dropdown selection
  const { data: requestsResponse } = useQuery({
    queryKey: ['plannerRequests'],
    queryFn: async () => {
      const res = await fetch('/api/planner-requests/planner');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    }
  });

  const activeClients = (requestsResponse?.data || []).filter(r => r.status === 'Accepted');

  // Shortlist Mutation
  const shortlistMutation = useMutation({
    mutationFn: async (vId) => {
      const res = await fetch('/api/vendors/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: vId })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to shortlist vendor');
      return result.data;
    },
    onSuccess: () => {
      showToast("Vendor added to your shortlist!", "success");
      queryClient.invalidateQueries({ queryKey: ['shortlistedVendors'] });
    },
    onError: (err) => {
      showToast(err.message || "Error shortlisting vendor", "error");
    }
  });

  // Assign Vendor Mutation
  const assignMutation = useMutation({
    mutationFn: async (assignmentData) => {
      const res = await fetch('/api/vendor-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to assign vendor');
      return result.data;
    },
    onSuccess: () => {
      showToast("Vendor assigned successfully!", "success");
      setIsAssignOpen(false);
      setAssignForm({ weddingId: '', role: 'Florist', budget: '', date: '' });
    }
  });

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignForm.weddingId) {
      showToast("Please select a wedding client event first", "error");
      return;
    }
    assignMutation.mutate({
      ...assignForm,
      vendorId: vendor._id
    });
  };

  if (vendorLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Retrieving vendor credentials...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Vendor profile not found</h3>
        <button onClick={() => navigate('/planner/vendors')} className="mt-4 px-4 py-2 bg-accent text-white rounded-xl">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center space-x-3 px-5 py-3 rounded-2xl shadow-xl text-white text-xs font-bold bg-emerald-600 border border-emerald-500"
          >
            <FiCheck className="w-5 h-5" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover and Profile Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-[#0f172a]">
        
        {/* Cover Image */}
        <div className="h-[220px] md:h-[300px] w-full relative">
          <img
            src={vendor.coverImage}
            alt="Vendor Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="relative px-6 pb-6 pt-16 md:pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 md:mt-0 md:-translate-y-8">
          
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <img
              src={vendor.vendorLogo}
              alt={vendor.businessName}
              className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-[#0f172a] shadow-2xl relative z-10"
            />
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] font-bold text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/20">
                {vendor.vendorType}
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {vendor.businessName}
              </h2>
              
              <div className="flex items-center justify-center md:justify-start space-x-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center">
                  <FiMapPin className="mr-1 text-accent" />
                  {vendor.location}
                </span>
                <span>•</span>
                <span className="flex items-center text-amber-500 font-bold">
                  <FiStar className="fill-current w-4 h-4 mr-1" />
                  {vendor.rating} Rating
                </span>
                <span>•</span>
                <span>{vendor.experience} Exp</span>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 z-10 md:-translate-y-2">
            <button
              onClick={() => navigate(`/planner/chat/${vendor.userId?._id || vendor.name?._id || vendor.userId}`)}
              className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all bg-white dark:bg-slate-900 shadow flex items-center space-x-1.5"
            >
              <FiMessageSquare className="w-4.5 h-4.5" />
              <span>Chat Vendor</span>
            </button>
            <button
              onClick={() => shortlistMutation.mutate(vendor._id)}
              className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all bg-white dark:bg-slate-900 shadow flex items-center space-x-1.5"
            >
              <FiHeart className="w-4.5 h-4.5" />
              <span>Shortlist</span>
            </button>
            <button
              onClick={() => setIsAssignOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-accent to-primary text-white font-bold text-xs shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all flex items-center space-x-1.5"
            >
              <FiBriefcase className="w-4.5 h-4.5" />
              <span>Assign Event</span>
            </button>
          </div>

        </div>

      </div>

      {/* Main Grid: Details Sidebar & Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Details panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Services & Offerings */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-3.5">Services Offered</h4>
              <div className="flex flex-wrap gap-2">
                {vendor.servicesOffered?.map((s) => (
                  <span key={s} className="text-[10px] font-bold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200/10">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance metrics */}
            <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 space-y-3.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-1">Service Metrics</h4>
              <div className="flex justify-between">
                <span className="flex items-center text-slate-500"><FiClock className="mr-1.5 text-accent" /> Response Time</span>
                <span>{vendor.responseTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center text-slate-500"><FiCompass className="mr-1.5 text-accent" /> Finished Events</span>
                <span>{vendor.completedEvents} Weddings</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center text-slate-500"><FiDollarSign className="mr-1.5 text-accent" /> Price Range</span>
                <span className="font-bold text-accent">{vendor.priceRange}</span>
              </div>
            </div>
          </div>

          {/* Contact Details & Availability Calendar */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">Availability Calendar</h4>
            <div className="p-3 rounded-2xl bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200/20 text-center text-xs">
              <span className="font-bold text-emerald-500">Currently Open for Bookings</span>
              <p className="text-[10px] text-slate-500 mt-1">Accepting inquiries for winter weddings 2026</p>
            </div>

            <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">Contact Details</h4>
              <div className="flex items-center space-x-3 text-xs text-slate-650 dark:text-slate-300">
                <FiMail className="text-accent w-4 h-4 flex-shrink-0" />
                <span>{vendor.contactDetails?.email || vendor.email?.email || "caterer@example.com"}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-650 dark:text-slate-300">
                <FiPhone className="text-accent w-4 h-4 flex-shrink-0" />
                <span>+91 {vendor.contactDetails?.phone || "9812345674"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Tab View */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tab buttons */}
          <div className="flex space-x-2 p-1 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl backdrop-blur-md">
            {[
              { id: 'portfolio', label: 'Pinterest Portfolio' },
              { id: 'events', label: 'Wedding History' },
              { id: 'reviews', label: `Verified Reviews (${reviews.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-accent to-primary text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          <div>
            
            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pinterest-Style Gallery</h4>
                
                {vendor.portfolio?.length > 0 ? (
                  <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {vendor.portfolio.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveLightbox({ url: img })}
                        className="break-inside-avoid relative rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-md cursor-pointer group"
                      >
                        <img
                          src={img}
                          alt={`gallery-${index}`}
                          className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-accent/80 px-3 py-1.5 rounded-full shadow-lg">
                            Zoom Image
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-xs">No gallery images uploaded yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* EVENTS HISTORY */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Wedding Events Completed</h4>
                
                {previousEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previousEvents.map((ev, index) => (
                      <div key={index} className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl space-y-3">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">{ev.name}</h5>
                          <span className="text-[9.5px] text-slate-400 flex items-center mt-1">
                            <FiMapPin className="mr-1 text-accent" />
                            {ev.venue}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-200/10 pt-2.5">
                          <span>Role: {ev.role}</span>
                          <span>Date: {new Date(ev.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-xs">No wedding entries registered.</p>
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Verified Reviews</h4>
                
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((rev, index) => (
                      <div key={index} className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-3xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.clientName}</span>
                          <div className="flex items-center text-amber-500 space-x-0.5">
                            {[...Array(rev.rating)].map((_, i) => (
                              <FiStar key={i} className="fill-current w-3.5 h-3.5" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-350 italic">
                          "{rev.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-xs">No reviews posted yet.</p>
                  </div>
                )}
              </div>
            )}

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
              className="fixed inset-0 bg-slate-950"
            />
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50"
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
                className="rounded-2xl max-w-full max-h-[85vh] object-contain shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSIGN VENDOR TO EVENT MODAL */}
      <AnimatePresence>
        {isAssignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 overflow-hidden text-xs font-semibold text-slate-700 dark:text-slate-350"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                    Assign Vendor to Wedding
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Propose job assignment to {vendor.businessName}</p>
                </div>
                <button onClick={() => setIsAssignOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Select Hired Wedding Event</label>
                  <select
                    required
                    value={assignForm.weddingId}
                    onChange={(e) => setAssignForm({ ...assignForm, weddingId: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">Select Wedding Event...</option>
                    {activeClients.map(c => (
                      <option key={c._id} value={c.clientId?._id || c.clientId}>
                        {c.clientId?.name?.name}'s Wedding ({c.weddingType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Role / Service Needed</label>
                  <input
                    type="text"
                    required
                    value={assignForm.role}
                    onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                    placeholder="e.g. Floral Mandap, Food Catering..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Service Budget (INR)</label>
                  <input
                    type="number"
                    required
                    value={assignForm.budget}
                    onChange={(e) => setAssignForm({ ...assignForm, budget: e.target.value })}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={assignForm.date}
                    onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={assignMutation.isPending}
                  className="w-full py-3.5 bg-gradient-to-r from-accent to-primary text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{assignMutation.isPending ? 'Sending Assignment Request...' : 'Send Job Assignment Proposal'}</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VendorProfile;
