import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMapPin, FiCalendar, FiMessageSquare, FiSliders, FiClock, FiX, FiCheck, FiSearch, FiHeart, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const AvailableVendors = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [weddingFilter, setWeddingFilter] = useState('');

  // Shortlist / Assignment modal triggers
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    weddingId: '',
    role: 'Florist',
    budget: '',
    date: ''
  });

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  // 1. Fetch All Active Vendors
  const { data: vendorsResponse, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await fetch('/api/vendors');
      if (!res.ok) throw new Error('Failed to load vendors');
      return res.json();
    }
  });

  const vendors = vendorsResponse?.data || [];

  // 2. Fetch Shortlisted Vendors for checking shortlisted state
  const { data: shortlistResponse } = useQuery({
    queryKey: ['shortlistedVendors'],
    queryFn: async () => {
      const res = await fetch('/api/vendors/shortlist/planner');
      if (!res.ok) throw new Error('Failed to load shortlist');
      return res.json();
    }
  });

  const shortlisted = shortlistResponse?.data || [];
  const shortlistedIds = new Set(shortlisted.map(s => s.vendorId?._id || s.vendorId));

  // 3. Fetch Hired Clients for Assignment Dropdown selection
  const { data: requestsResponse } = useQuery({
    queryKey: ['plannerRequests'],
    queryFn: async () => {
      const res = await fetch('/api/planner-requests/planner');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    }
  });

  const activeClients = (requestsResponse?.data || []).filter(r => r.status === 'Accepted');

  // 4. Fetch Planner Assignments to check vendor bookings
  const { data: assignmentsResponse } = useQuery({
    queryKey: ['plannerAssignments'],
    queryFn: async () => {
      const res = await fetch('/api/vendor-assignments/planner');
      if (!res.ok) throw new Error('Failed to load assignments');
      return res.json();
    }
  });

  const assignments = assignmentsResponse?.data || [];

  // Helper to check if vendor is booked on a specific date
  const isBookedOnDate = (vendorId, date) => {
    if (!date) return false;
    const targetDate = new Date(date).toDateString();
    return assignments.some(a => {
      const aVendorId = a.vendorId?._id || a.vendorId;
      const aDate = new Date(a.date).toDateString();
      return (aVendorId?.toString() === vendorId?.toString()) &&
             (a.status === 'Accepted' || a.status === 'Completed') &&
             (aDate === targetDate);
    });
  };

  // Shortlist Mutation
  const shortlistMutation = useMutation({
    mutationFn: async (vendorId) => {
      const res = await fetch('/api/vendors/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
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
      showToast("Vendor assigned! Job proposal sent to vendor.", "success");
      setIsAssignOpen(false);
      setAssignForm({ weddingId: '', role: 'Florist', budget: '', date: '' });
      queryClient.invalidateQueries({ queryKey: ['plannerAssignments'] });
    },
    onError: (err) => {
      showToast(err.message || "Error assigning vendor", "error");
    }
  });

  const handleShortlist = (vendorId) => {
    shortlistMutation.mutate(vendorId);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignForm.weddingId) {
      showToast("Please select a wedding client event first", "error");
      return;
    }
    assignMutation.mutate({
      ...assignForm,
      vendorId: selectedVendor._id
    });
  };

  // Filter Categories
  const categories = ['All', 'Catering', 'Florist', 'Photography', 'Decor', 'Venue'];

  // Filtering Logic
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      v.vendorType?.toLowerCase().includes(search.toLowerCase()) ||
      v.servicesOffered?.some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || v.vendorType === categoryFilter;
    const matchesStatus = statusFilter === 'All' || v.availabilityStatus === statusFilter;

    // Wedding matching logic (matches place & wedding date)
    let matchesWedding = true;
    if (weddingFilter) {
      const selectedW = activeClients.find(c => c._id === weddingFilter);
      if (selectedW) {
        const locationMatches = v.location?.toLowerCase().trim() === selectedW.location?.toLowerCase().trim();
        const dateMatches = !isBookedOnDate(v._id, selectedW.weddingDate);
        matchesWedding = locationMatches && dateMatches;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesWedding;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500 text-white';
      case 'Busy': return 'bg-amber-500 text-white';
      case 'Booked': return 'bg-rose-500 text-white';
      case 'Offline': return 'bg-slate-400 text-white';
      case 'Vacation': return 'bg-indigo-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
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
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/25' : 'bg-rose-600 border-rose-500 shadow-rose-500/25'
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
            Available Vendors Registry
          </h2>
          <p className="text-xs text-slate-500 mt-1">Shortlist premium caterers, florists, and photographers, and assign them to weddings.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/50 dark:bg-darkcard/40 p-4 rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 backdrop-blur-md shadow-sm">
        
        {/* Search */}
        <div className="md:col-span-4 relative">
          <input
            type="text"
            placeholder="Search by business name, services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-darkbg border border-rosegold/20 dark:border-goldAccent/15 text-sm outline-none transition-all focus:border-accent"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4.5 h-4.5" />
        </div>

        {/* Wedding Match Filter */}
        <div className="md:col-span-3">
          <select
            value={weddingFilter}
            onChange={(e) => setWeddingFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-darkbg border border-rosegold/20 dark:border-goldAccent/15 text-sm outline-none focus:border-accent font-semibold"
          >
            <option value="">Match Hired Wedding...</option>
            {activeClients.map(c => (
              <option key={c._id} value={c._id}>
                {c.clientId?.name?.name}'s Wedding ({c.location})
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-darkbg border border-rosegold/20 dark:border-goldAccent/15 text-sm outline-none focus:border-accent"
          >
            <option value="All">All Categories</option>
            {categories.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-darkbg border border-rosegold/20 dark:border-goldAccent/15 text-sm outline-none focus:border-accent"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Booked">Booked</option>
            <option value="Offline">Offline</option>
            <option value="Vacation">Vacation</option>
          </select>
        </div>

      </div>

      {/* Loading States */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-[40px] border border-rosegold/20 dark:border-goldAccent/15 p-6 space-y-4 animate-pulse bg-white dark:bg-darkcard">
              <div className="w-full aspect-[4/5] rounded-[30px] bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredVendors.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
          <FiSliders className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-base font-extrabold text-slate-850 dark:text-white">No vendors found matching your filters</h3>
          <button
            onClick={() => { setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); }}
            className="mt-6 px-5 py-2.5 bg-cream hover:bg-cream/80 dark:bg-darkbg dark:hover:bg-darkbg/50 text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Grid of Vendors */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVendors.map((vendor) => {
            const isShortlisted = shortlistedIds.has(vendor._id);

            return (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white/90 dark:bg-darkcard/95 border border-rosegold/30 dark:border-goldAccent/25 rounded-[40px] p-5 shadow-lg flex flex-col justify-between hover:shadow-xl hover:border-accent/50 dark:hover:border-goldAccent/50 transition-all duration-300 relative group"
              >
                
                {/* Cover & Logo Area */}
                <div className="relative w-full aspect-[4/5] rounded-[30px] overflow-hidden border border-rosegold/30 dark:border-goldAccent/25 shadow-inner">
                  <img
                    src={vendor.coverImage}
                    alt={vendor.businessName}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent flex flex-col justify-end p-5" />
                  
                  {/* Vendor category overlay */}
                  <div className="absolute bottom-5 left-5 flex items-center space-x-3">
                    <img 
                      src={vendor.vendorLogo} 
                      alt="Logo" 
                      className="w-10 h-10 rounded-full border border-white/40 object-cover" 
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-white leading-tight">{vendor.businessName}</h3>
                      <span className="text-[10px] font-bold text-accent tracking-wider uppercase">{vendor.vendorType}</span>
                    </div>
                  </div>

                  {/* Rating badge */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-full bg-white/95 dark:bg-darkcard/95 text-amber-500 font-extrabold text-[10px] shadow border border-rosegold/20 dark:border-goldAccent/15">
                    <FiStar className="fill-current w-3.5 h-3.5" />
                    <span>{vendor.rating}</span>
                  </div>

                  {/* Availability Badge */}
                  <div className={`absolute top-4 left-4 flex items-center space-x-1 px-3 py-1 rounded-full font-extrabold text-[9px] shadow ${getStatusColor(vendor.availabilityStatus)}`}>
                    <FiClock className="w-3.5 h-3.5" />
                    <span>{vendor.availabilityStatus}</span>
                  </div>
                </div>

                {/* Details & Services */}
                <div className="py-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-slate-700 dark:text-slate-350 font-bold">
                      <span className="flex items-center">
                        <FiMapPin className="mr-1 text-accent" />
                        {vendor.location}
                      </span>
                      <span>{vendor.experience} Experience</span>
                    </div>

                    {/* Services tag cloud */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {vendor.servicesOffered?.slice(0, 3).map((serv) => (
                        <span key={serv} className="text-[9.5px] bg-cream/40 dark:bg-goldAccent/10 border border-rosegold/20 dark:border-goldAccent/25 px-2.5 py-1 rounded-full text-slate-800 dark:text-goldAccent font-semibold">
                          {serv}
                        </span>
                      ))}
                      {vendor.servicesOffered?.length > 3 && (
                        <span className="text-[9.5px] font-extrabold text-accent px-1.5 py-0.5">
                          +{vendor.servicesOffered.length - 3} More
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing / latency details */}
                  <div className="flex justify-between items-center border-t border-b border-rosegold/20 dark:border-goldAccent/20 py-2 text-[10.5px] font-extrabold text-slate-800 dark:text-slate-250">
                    <span className="flex items-center">
                      <FiDollarSign className="mr-1 text-accent w-4 h-4" />
                      {vendor.priceRange}
                    </span>
                    <span className="text-[9.5px] text-slate-500 dark:text-slate-400">
                      Response: {vendor.responseTime}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                    
                    {/* View Profile */}
                    <button
                      onClick={() => navigate(`/planner/vendors/${vendor._id}`)}
                      className="py-2.5 border border-rosegold/30 dark:border-goldAccent/25 hover:border-accent dark:hover:border-goldAccent text-slate-700 dark:text-slate-300 hover:text-accent dark:hover:text-goldAccent hover:bg-rosegold/5 dark:hover:bg-goldAccent/5 text-[10.5px] font-extrabold rounded-xl transition-all"
                    >
                      View Profile
                    </button>

                    {/* Shortlist Vendor */}
                    <button
                      onClick={() => handleShortlist(vendor._id)}
                      disabled={isShortlisted || shortlistMutation.isPending}
                      className={`py-2.5 border text-[10.5px] font-extrabold rounded-xl transition-all flex items-center justify-center space-x-1 ${
                        isShortlisted 
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 cursor-default' 
                          : 'border-rosegold/30 dark:border-goldAccent/25 hover:border-accent dark:hover:border-goldAccent text-slate-700 dark:text-slate-300 hover:text-accent dark:hover:text-goldAccent hover:bg-rosegold/5 dark:hover:bg-goldAccent/5'
                      }`}
                    >
                      <FiHeart className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current text-emerald-500' : ''}`} />
                      <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                    </button>

                    {/* Chat Vendor */}
                    <button
                      onClick={() => navigate(`/planner/chat/${vendor.userId?._id || vendor.name?._id || vendor.userId}`)}
                      className="py-2.5 border border-rosegold/30 dark:border-goldAccent/25 hover:border-accent dark:hover:border-goldAccent text-slate-700 dark:text-slate-300 hover:text-accent dark:hover:text-goldAccent hover:bg-rosegold/5 dark:hover:bg-goldAccent/5 text-[10.5px] font-extrabold rounded-xl transition-all flex items-center justify-center space-x-1.5"
                    >
                      <FiMessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Vendor</span>
                    </button>

                    {/* Assign Vendor to Event */}
                    <button
                      onClick={() => { setSelectedVendor(vendor); setIsAssignOpen(true); }}
                      className="py-2.5 bg-slate-900 dark:bg-gradient-to-r dark:from-accent dark:to-primary text-white dark:text-slate-950 font-extrabold text-[10.5px] rounded-xl hover:scale-[1.02] shadow-md flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <FiBriefcase className="w-3.5 h-3.5" />
                      <span>Assign Event</span>
                    </button>

                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* ASSIGN VENDOR TO EVENT MODAL */}
      <AnimatePresence>
        {isAssignOpen && selectedVendor && (
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
              className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 shadow-2xl relative z-10 overflow-hidden text-xs font-semibold text-slate-700 dark:text-slate-350"
            >
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                    Assign Vendor to Wedding
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Propose job assignment to {selectedVendor.businessName}</p>
                </div>
                <button
                  onClick={() => setIsAssignOpen(false)}
                  className="p-1.5 rounded-full hover:bg-cream dark:hover:bg-darkbg/50 text-slate-400"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                
                {/* Select Wedding */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Select Hired Wedding Event</label>
                  <select
                    required
                    value={assignForm.weddingId}
                    onChange={(e) => {
                      const wId = e.target.value;
                      const selectedW = activeClients.find(c => (c.clientId?._id || c.clientId) === wId);
                      const wDate = selectedW?.weddingDate ? new Date(selectedW.weddingDate).toISOString().split('T')[0] : '';
                      setAssignForm({
                        ...assignForm,
                        weddingId: wId,
                        date: wDate
                      });
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">Select Wedding Event...</option>
                    {activeClients
                      .filter(c => c.location?.toLowerCase().trim() === selectedVendor?.location?.toLowerCase().trim())
                      .map(c => (
                        <option key={c._id} value={c.clientId?._id || c.clientId}>
                          {c.clientId?.name?.name}'s Wedding ({c.weddingType})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Role / Services */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Role / Service Needed</label>
                  <input
                    type="text"
                    required
                    value={assignForm.role}
                    onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                    placeholder="e.g. Floral Mandap, Food Catering..."
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Service Budget (INR)</label>
                  <input
                    type="number"
                    required
                    value={assignForm.budget}
                    onChange={(e) => setAssignForm({ ...assignForm, budget: e.target.value })}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Assignment Date */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[10px] tracking-wider text-slate-500">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={assignForm.date}
                    onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={assignMutation.isPending}
                  className="w-full py-3.5 bg-slate-900 dark:bg-gradient-to-r dark:from-accent dark:to-primary text-white dark:text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center"
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

export default AvailableVendors;
