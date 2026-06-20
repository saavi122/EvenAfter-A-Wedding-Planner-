import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { FiCheck, FiX, FiCalendar, FiMessageSquare, FiUsers, FiClock, FiActivity, FiMapPin, FiInfo, FiCompass, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const VendorDashboard = () => {
  const { user, profile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

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
        showToast(notif.message, "success");
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
      showToast(`Assignment ${variables.status.toLowerCase()}ed successfully!`, "success");
      queryClient.invalidateQueries({ queryKey: ['vendorAssignments'] });
    },
    onError: (err) => {
      showToast(err.message || "Error updating assignment", "error");
    }
  });

  // Mutation to update vendor availability status
  const updateProfileMutation = useMutation({
    mutationFn: async (availabilityStatus) => {
      const res = await fetch(`/api/vendors/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to update profile');
      return result.data;
    },
    onSuccess: () => {
      showToast("Availability status updated successfully!", "success");
      refreshUser(); // Refresh the AuthContext profile details
    },
    onError: (err) => {
      showToast(err.message || "Error updating status", "error");
    }
  });

  const handleUpdateStatus = (assignmentId, status) => {
    updateStatusMutation.mutate({ assignmentId, status });
  };

  const handleAvailabilityChange = (e) => {
    updateProfileMutation.mutate(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Busy': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Booked': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'Offline': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      case 'Vacation': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
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
              Vendor Suite: <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">{profile?.businessName || user?.name}</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-lg font-light leading-relaxed">
              Accept wedding assignments, update your real-time booking availability, and chat with connected coordinators to manage logistics.
            </p>
          </div>

          {/* Availability Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col space-y-1.5 self-start md:self-auto min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Set Live Status</span>
            <select
              value={profile?.availabilityStatus || "Available"}
              onChange={handleAvailabilityChange}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold outline-none text-white focus:border-accent"
            >
              <option value="Available">Available (Accepting requests)</option>
              <option value="Busy">Busy (Limited availability)</option>
              <option value="Booked">Booked (Fully occupied)</option>
              <option value="Offline">Offline</option>
              <option value="Vacation">On Vacation</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Total Weddings Assigned', val: activeWeddings.length, label: 'Active Weddings Handled', icon: FiBriefcase, col: 'text-sky-500 bg-sky-500/10' },
          { name: 'Connected Planners', val: connectedPlanners.length, label: 'Active Planner Dialogues', icon: FiUsers, col: 'text-purple-500 bg-purple-500/10' },
          { name: 'Incoming Requests', val: pendingRequests.length, label: 'Needs Action', icon: FiClock, col: 'text-accent bg-accent/10' },
          { name: 'Completed Ceremonies', val: profile?.completedEvents || 0, label: 'Lifetime Completed Weddings', icon: FiCompass, col: 'text-emerald-500 bg-emerald-500/10' }
        ].map((stat, i) => (
          <div key={i} className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-3xl flex items-center space-x-4 shadow-sm">
            <div className={`p-3 rounded-2xl ${stat.col} flex-shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-450">{stat.name}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.val}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Grid: Incoming assignments & Assigned Weddings list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Incoming assignments */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Incoming assignments */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/20 pb-3.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                <span className="w-3 h-3 rounded-full bg-accent mr-2.5" />
                Incoming Job Assignments ({pendingRequests.length})
              </h3>
            </div>

            {assignmentsLoading && <p className="text-xs text-slate-400 py-4 text-center">Loading briefs...</p>}
            {!assignmentsLoading && pendingRequests.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FiClock className="w-8 h-8 mx-auto mb-2 text-slate-350" />
                <p className="text-xs">No pending assignments at this time.</p>
              </div>
            )}

            {!assignmentsLoading && pendingRequests.map((assign) => (
              <div key={assign._id} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Event: {assign.weddingId?.EventIdName || "Sarah & David's Royal Wedding"}
                    </span>
                    <span className="text-[9px] bg-accent/15 text-accent px-2 py-0.5 rounded font-bold uppercase">
                      {assign.role}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-semibold flex items-center">
                    <FiMapPin className="mr-1 w-3 h-3 text-accent" />
                    {assign.weddingId?.location || "Udaipur"} • Budget Offer: {assign.budget?.toLocaleString()} INR • Date: {new Date(assign.date).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-slate-650 dark:text-slate-400 font-bold">
                    Planner: {assign.plannerId?.companyName || assign.plannerId?.name?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <button
                    onClick={() => handleUpdateStatus(assign._id, "Accepted")}
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center space-x-1"
                  >
                    <FiCheck className="w-4.5 h-4.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(assign._id, "Rejected")}
                    className="flex-1 md:flex-none px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center space-x-1"
                  >
                    <FiX className="w-4.5 h-4.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Assigned weddings roster */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/20 pb-3.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2.5" />
                Assigned Wedding Ceremonies ({activeWeddings.length})
              </h3>
            </div>

            {activeWeddings.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No ongoing weddings assigned yet.</p>
            )}

            {activeWeddings.map((assign) => (
              <div key={assign._id} className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-850 flex justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent font-black text-sm flex items-center justify-center">
                    W
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {assign.weddingId?.EventIdName || "Royal Palace Wedding"}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">{assign.role} • {assign.weddingId?.location || "Goa"}</p>
                    <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Date: {new Date(assign.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/vendor/chat/${assign.plannerId?.name?._id || assign.plannerId?.userId?._id}`)}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border border-slate-200/50 dark:border-slate-800"
                    title="Direct Chat with Planner"
                  >
                    <FiMessageSquare className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Connected Planners list */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Connected Planners */}
          <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Connected Planners</h4>
            
            <div className="space-y-3">
              {connectedPlanners.length === 0 && (
                <p className="text-xs text-slate-400 py-2">No connected planners yet.</p>
              )}
              {connectedPlanners.map((p) => (
                <div 
                  key={p._id} 
                  onClick={() => navigate(`/vendor/chat/${p.name?._id || p.userId?._id}`)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-900/40 cursor-pointer border border-transparent hover:border-slate-200/10 transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <img src={p.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{p.companyName}</h5>
                      <span className="text-[9px] text-slate-500 font-semibold">{p.city} • {p.exprience}</span>
                    </div>
                  </div>
                  <FiMessageSquare className="w-4 h-4 text-slate-400 group-hover:text-accent" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default VendorDashboard;
