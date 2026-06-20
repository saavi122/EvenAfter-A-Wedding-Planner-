import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiCalendar, FiMessageSquare, FiBriefcase, FiUsers, FiStar, FiActivity, FiMapPin, FiInfo, FiChevronRight, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const PlannerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  // 1. Fetch Client Hiring Requests
  const { data: requestsResponse, isLoading: requestsLoading } = useQuery({
    queryKey: ['plannerRequests'],
    queryFn: async () => {
      const res = await fetch('/api/planner-requests/planner');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    }
  });

  const requests = requestsResponse?.data || [];
  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const activeClients = requests.filter(r => r.status === 'Accepted');

  // 2. Fetch Shortlisted Vendors
  const { data: shortlistedResponse } = useQuery({
    queryKey: ['shortlistedVendors'],
    queryFn: async () => {
      const res = await fetch('/api/vendors/shortlist/planner');
      if (!res.ok) throw new Error('Failed to fetch shortlist');
      return res.json();
    }
  });

  const shortlistedVendors = shortlistedResponse?.data || [];

  // 3. Fetch Assignments created by Planner
  const { data: assignmentsResponse } = useQuery({
    queryKey: ['plannerAssignments'],
    queryFn: async () => {
      const res = await fetch('/api/vendor-assignments/planner');
      if (!res.ok) throw new Error('Failed to fetch assignments');
      return res.json();
    }
  });

  const assignments = assignmentsResponse?.data || [];
  const pendingAssignments = assignments.filter(a => a.status === 'Pending');

  // 4. Fetch All Vendors to compile widgets
  const { data: vendorsResponse } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await fetch('/api/vendors');
      if (!res.ok) throw new Error('Failed to fetch vendors');
      return res.json();
    }
  });

  const vendors = vendorsResponse?.data || [];
  const topRatedVendors = [...vendors].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 3);
  const activeVendors = vendors.filter(v => v.availabilityStatus === 'Available').slice(0, 3);

  // Update Client Proposal Request status (Accept / Reject)
  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      const res = await fetch(`/api/planner-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Error updating status');
      return result.data;
    },
    onSuccess: (data, variables) => {
      showToast(`Hiring proposal successfully ${variables.status.toLowerCase()}ed!`, "success");
      queryClient.invalidateQueries({ queryKey: ['plannerRequests'] });
    },
    onError: (err) => {
      showToast(err.message || "Error updating proposal status", "error");
    }
  });

  const handleRequestStatus = (requestId, status) => {
    updateRequestMutation.mutate({ requestId, status });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-16"
    >
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-5 py-3 rounded-2xl shadow-xl text-white text-xs font-bold border ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'
            }`}
          >
            {toast.type === 'success' ? <FiCheck className="w-5 h-5" /> : <FiX className="w-5 h-5" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-black p-8 text-white border border-slate-800 shadow-xl"
      >
        <div className="absolute top-[-30%] right-[-10%] w-[350px] h-[350px] rounded-full bg-accent/10 blur-[90px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              Planner Dashboard: <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">{user?.name}</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-lg font-light leading-relaxed">
              Curate magnificent experiences, coordinate vendor bookings, and manage client wedding proposals from a single elegant interface.
            </p>
          </div>
          <Link
            to="/planner/vendors"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all text-xs"
          >
            <span>Explore Vendor Registry</span>
            <FiChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </motion.div>

      {/* 4 Cards Stats Widgets */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Active Clients', val: activeClients.length, label: 'Hired & Active Contracts', icon: FiUsers, col: 'text-sky-500 bg-sky-500/10' },
          { name: 'Shortlisted Vendors', val: shortlistedVendors.length, label: 'Preferred Partners', icon: FiStar, col: 'text-amber-500 bg-amber-500/10' },
          { name: 'Pending Client Briefs', val: pendingRequests.length, label: 'Needs Immediate Review', icon: FiBriefcase, col: 'text-accent bg-accent/10' },
          { name: 'Pending Vendor Bookings', val: pendingAssignments.length, label: 'Waiting for Responses', icon: FiClock, col: 'text-purple-500 bg-purple-500/10' }
        ].map((stat, i) => (
          <div key={i} className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-3xl flex items-center space-x-4 shadow-sm">
            <div className={`p-3 rounded-2xl ${stat.col} flex-shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{stat.name}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.val}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Grid: Client requests & Vendor widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Client requests & Connected Clients */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Pending Requests */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/20 pb-3.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                <span className="w-3 h-3 rounded-full bg-accent mr-2.5" />
                Incoming Client Proposals ({pendingRequests.length})
              </h3>
            </div>

            {requestsLoading && <p className="text-xs text-slate-400 py-4 text-center">Curating incoming details...</p>}
            {!requestsLoading && pendingRequests.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FiBriefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No pending client proposals at the moment.</p>
              </div>
            )}

            {!requestsLoading && pendingRequests.map((reqItem) => (
              <div key={reqItem._id} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {reqItem.clientId?.name?.name || "Client Name"}
                    </span>
                    <span className="text-[9px] bg-accent/15 text-accent px-2 py-0.5 rounded font-bold">
                      {reqItem.weddingType}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold flex items-center">
                    <FiMapPin className="mr-1 w-3 h-3 text-accent" />
                    {reqItem.location} • Budget: {(reqItem.budget / 100000).toFixed(1)} Lakhs • Date: {new Date(reqItem.weddingDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-650 dark:text-slate-400 italic">
                    "{reqItem.requirements || 'No special requirements detailed.'}"
                  </p>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <button
                    onClick={() => handleRequestStatus(reqItem._id, "Accepted")}
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center space-x-1.5"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleRequestStatus(reqItem._id, "Rejected")}
                    className="flex-1 md:flex-none px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center space-x-1.5"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Clients ("My Clients") */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/20 pb-3.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2.5" />
                My Clients ({activeClients.length})
              </h3>
            </div>

            {activeClients.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No active client weddings on your roster yet.</p>
            )}

            {activeClients.map((clientRequest) => (
              <div key={clientRequest._id} className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-850 flex justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent font-black text-sm flex items-center justify-center">
                    {clientRequest.clientId?.name?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {clientRequest.clientId?.name?.name || "Client Name"}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">{clientRequest.weddingType} • {clientRequest.location}</p>
                    <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Date: {new Date(clientRequest.weddingDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/planner/chat/${clientRequest.clientId?.name?._id}`)}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border border-slate-200/50 dark:border-slate-800"
                    title="Direct Chat"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/planner/vendors`)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-accent hover:text-white dark:bg-slate-800 text-[10px] font-bold rounded-xl transition-all"
                  >
                    Manage Vendors
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side Widgets: Available Vendors, Top Rated, Performance */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Rated Vendors Widget */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Rated Vendors</h4>
            
            <div className="space-y-3">
              {topRatedVendors.map((v) => (
                <div 
                  key={v._id} 
                  onClick={() => navigate(`/planner/vendors/${v._id}`)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer border border-transparent hover:border-slate-200/10 transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <img src={v.vendorLogo} alt="Logo" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{v.businessName}</h5>
                      <span className="text-[9px] text-slate-500 font-semibold">{v.vendorType}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-0.5 text-amber-500 text-[10.5px] font-bold">
                    <FiStar className="fill-current" />
                    <span>{v.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Vendors (Online/Active) Widget */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recently Active Vendors</h4>
            
            <div className="space-y-3">
              {activeVendors.map((v) => (
                <div 
                  key={v._id}
                  onClick={() => navigate(`/planner/vendors/${v._id}`)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <img src={v.vendorLogo} alt="Logo" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-900 dark:text-white">{v.businessName}</h5>
                      <span className="text-[9px] text-slate-500 font-semibold">{v.location} • {v.experience} Exp</span>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Online / Available" />
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Performance Metrics */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Performance Metrics</h4>
            
            <div className="space-y-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span>Vendor Response Rate</span>
                  <span className="text-emerald-500 font-bold">98%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[98%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span>Average Response Latency</span>
                  <span className="text-accent font-bold">&lt; 45 mins</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span>On-time Deliveries</span>
                  <span className="text-purple-500 font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[100%]" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default PlannerDashboard;
