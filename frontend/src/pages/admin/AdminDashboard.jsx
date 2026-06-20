import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiShield, FiTrendingUp, FiActivity, FiCheck, FiX, 
  FiMail, FiPhone, FiTrash2, FiMessageSquare, FiCheckCircle, FiHeart, FiGift, FiAward, FiSettings 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import weddingSetupImage from '../../assets/luxury_wedding_setup.png';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  
  // FAQs form state
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
  // Testimonials form state
  const [testForm, setTestForm] = useState({ clientName: '', reviewText: '', rating: 5 });
  // Gallery form state
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', title: '', category: 'Ceremony' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  // Queries
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    }
  });

  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      return res.json();
    }
  });

  const { data: pendingVendorsResponse, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingVendors'],
    queryFn: async () => {
      const res = await fetch('/api/admin/vendors/pending');
      if (!res.ok) throw new Error('Failed to load pending vendors');
      return res.json();
    }
  });

  const { data: auditLogsResponse, isLoading: auditLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/audit-logs');
      if (!res.ok) throw new Error('Failed to load audit logs');
      return res.json();
    }
  });

  const { data: faqsResponse } = useQuery({
    queryKey: ['adminFaqs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/faqs');
      return res.json();
    }
  });

  const { data: testResponse } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: async () => {
      const res = await fetch('/api/admin/testimonials');
      return res.json();
    }
  });

  const { data: galleryResponse } = useQuery({
    queryKey: ['adminGallery'],
    queryFn: async () => {
      const res = await fetch('/api/admin/gallery');
      return res.json();
    }
  });

  const stats = statsResponse?.data || {};
  const users = usersResponse?.data || [];
  const pendingVendors = pendingVendorsResponse?.data || [];
  const auditLogs = auditLogsResponse?.data || [];
  const faqsList = faqsResponse?.data || [];
  const testimonialsList = testResponse?.data || [];
  const galleryList = galleryResponse?.data || [];

  // Mutations
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.json();
    },
    onSuccess: (data) => {
      showToast("User status updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    }
  });

  const approveVendorMutation = useMutation({
    mutationFn: async ({ vendorId, isApproved }) => {
      const res = await fetch(`/api/admin/vendors/${vendorId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      });
      return res.json();
    },
    onSuccess: () => {
      showToast("Vendor profile status updated", "success");
      queryClient.invalidateQueries({ queryKey: ['pendingVendors'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      return res.json();
    },
    onSuccess: () => {
      showToast("User account permanently deleted", "success");
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    }
  });

  const broadcastMutation = useMutation({
    mutationFn: async (message) => {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!res.ok) throw new Error('Broadcast failed');
      return res.json();
    },
    onSuccess: () => {
      showToast("Global broadcast notification sent successfully!", "success");
      setBroadcastMsg('');
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    }
  });

  // Content mutations
  const createFaqMutation = useMutation({
    mutationFn: async (faqData) => {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqData)
      });
      return res.json();
    },
    onSuccess: () => {
      showToast("FAQ added to homepage", "success");
      setFaqForm({ question: '', answer: '' });
      queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
    }
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      showToast("FAQ removed", "success");
      queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
    }
  });

  const createTestMutation = useMutation({
    mutationFn: async (testData) => {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      return res.json();
    },
    onSuccess: () => {
      showToast("Testimonial added to homepage", "success");
      setTestForm({ clientName: '', reviewText: '', rating: 5 });
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
    }
  });

  const deleteTestMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      showToast("Testimonial removed", "success");
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
    }
  });

  const createGalleryMutation = useMutation({
    mutationFn: async (galData) => {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galData)
      });
      return res.json();
    },
    onSuccess: () => {
      showToast("Gallery image added to homepage", "success");
      setGalleryForm({ imageUrl: '', title: '', category: 'Ceremony' });
      queryClient.invalidateQueries({ queryKey: ['adminGallery'] });
    }
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      showToast("Gallery item removed", "success");
      queryClient.invalidateQueries({ queryKey: ['adminGallery'] });
    }
  });

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    broadcastMutation.mutate(broadcastMsg);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'client': return 'bg-rose-500/10 text-rosegold border border-rosegold/20';
      case 'planner': return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'vendor': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'superadmin': return 'bg-goldAccent/10 text-goldAccent border border-goldAccent/20';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="space-y-10 pb-16 font-roboto bg-transparent">
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

      {/* Luxury Wedding Cover Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/35 dark:bg-darkcard p-6 md:p-10 shadow-md">
        {/* Soft layout overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={weddingSetupImage}
            alt="Luxury Wedding Setup"
            className="w-full h-full object-cover filter brightness-[0.6] dark:brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-transparent" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-15 dark:opacity-5 pointer-events-none select-none z-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-rosegold dark:text-goldAccent w-full h-full animate-spin-slow">
            <path d="M50 0 C40 20 20 40 0 50 C20 60 40 80 50 100 C60 80 80 60 100 50 C80 40 60 20 50 0 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
          <div className="space-y-2">
            <span className="inline-block text-[10px] font-semibold tracking-[0.3em] text-goldAccent dark:text-goldAccent uppercase drop-shadow">
              EvenAfter Master Registry
            </span>
            <h2 className="font-playfair text-3xl md:text-5xl font-light tracking-wide drop-shadow-md">
              Super Admin Suite
            </h2>
            <p className="text-white/80 text-xs md:text-sm max-w-lg font-light leading-relaxed tracking-wide drop-shadow">
              Curate homepage exhibits, moderate registration logs, approve vendor credentials, and orchestrate global wedding communications.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-rosegold/20 dark:border-goldAccent/15 pb-2">
        {[
          { id: 'overview', label: 'Overview & Stats' },
          { id: 'users', label: 'Manage Users' },
          { id: 'vendors', label: 'Vendor Verifications' },
          { id: 'broadcast', label: 'Global Broadcast' },
          { id: 'content', label: 'Homepage Curation' },
          { id: 'audit', label: 'Audit Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 border-t border-x border-transparent -mb-2 ${
              activeTab === tab.id
                ? 'bg-cream/45 dark:bg-darkcard text-rosegold dark:text-goldAccent border-rosegold/25 dark:border-goldAccent/25 font-playfair font-semibold'
                : 'text-darktext/70 dark:text-gray-400 hover:text-rosegold dark:hover:text-goldAccent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Active Couples', val: stats.clientsCount || 0, label: 'Client Accounts', icon: FiHeart, col: 'text-rosegold bg-rosegold/10' },
                  { name: 'Curators/Planners', val: stats.plannersCount || 0, label: 'Elite Coordinators', icon: FiShield, col: 'text-amber-600 bg-amber-500/10' },
                  { name: 'Pending Registrations', val: pendingVendors.length, label: 'Verification Queue', icon: FiActivity, col: 'text-rosegold bg-rosegold/10' },
                  { name: 'Platform Revenue', val: `${(stats.estimatedPlatformCommission || 0).toLocaleString()} INR`, label: 'Estimated 5% Fee Commission', icon: FiTrendingUp, col: 'text-emerald-600 bg-emerald-500/10' }
                ].map((stat, i) => (
                  <div key={i} className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-5 flex items-center space-x-4 shadow-sm">
                    <div className={`p-3 rounded-2xl ${stat.col} flex-shrink-0`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-darktext/60 dark:text-gray-400">{stat.name}</p>
                      <h3 className="text-xl font-bold font-playfair text-darktext dark:text-goldAccent mt-0.5">{stat.val}</h3>
                      <p className="text-[10px] text-darktext/50 font-semibold mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Extra stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair mb-4">Total Contract Volume</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold font-playfair text-darktext dark:text-white">{(stats.totalBudgetSum || 0).toLocaleString()}</span>
                    <span className="text-[10px] font-semibold text-darktext/50 uppercase tracking-widest">INR In Circulation</span>
                  </div>
                  <p className="text-[10px] text-darktext/55 dark:text-gray-400 mt-2 font-light">Combined wedding budgets configured by active couples</p>
                </div>
                <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair mb-2">Total Wedding Projects</h3>
                    <h4 className="text-2xl font-bold font-playfair text-darktext dark:text-white">{stats.totalWeddingsCount || 0} Events</h4>
                  </div>
                  <p className="text-[10px] text-darktext/55 dark:text-gray-400 mt-4 font-light">Active, ongoing, and completed royal wedding events currently tracked.</p>
                </div>
              </div>
            </div>
          )}

          {/* MANAGE USERS TAB */}
          {activeTab === 'users' && (
            <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 font-playfair">Registered Accounts</h3>
              {usersLoading && <p className="text-xs text-darktext/60 dark:text-gray-400 py-4 text-center">Loading users...</p>}
              {!usersLoading && users.length === 0 && <p className="text-xs text-darktext/60 dark:text-gray-400 py-4 text-center">No registered accounts found.</p>}
              {!usersLoading && users.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-rosegold/20 text-rosegold dark:text-goldAccent uppercase tracking-widest font-bold font-playfair">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-rosegold/10 hover:bg-cream/10 dark:hover:bg-darkcard/25 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-darktext dark:text-white font-playfair">{u.name}</td>
                          <td className="py-3.5 px-4 text-darktext/75 dark:text-gray-400">{u.email}</td>
                          <td className="py-3.5 px-4 capitalize">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${getRoleBadge(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-darktext/60 dark:text-gray-450">{u.phoneNo}</td>
                          <td className="py-3.5 px-4 capitalize">
                            <span className={`font-bold ${u.status === 'suspended' ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {u.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right flex items-center justify-end space-x-2">
                            {u._id !== user?._id && (
                              <>
                                <button
                                  onClick={() => updateUserStatusMutation.mutate({ userId: u._id, status: u.status === 'suspended' ? 'active' : 'suspended' })}
                                  className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase border tracking-wider transition-all duration-300 ${
                                    u.status === 'suspended' 
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20' 
                                      : 'bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20'
                                  }`}
                                >
                                  {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                                </button>
                                <button
                                  onClick={() => { if(window.confirm('Delete this account permanently?')) deleteUserMutation.mutate(u._id) }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VENDOR VERIFICATIONS TAB */}
          {activeTab === 'vendors' && (
            <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 font-playfair">Pending Vendor Registrations</h3>
              {pendingLoading && <p className="text-xs text-darktext/60 dark:text-gray-400 py-4 text-center">Loading briefs...</p>}
              {!pendingLoading && pendingVendors.length === 0 && (
                <div className="text-center py-8 text-rosegold">
                  <FiCheckCircle className="w-10 h-10 mx-auto mb-2 text-rosegold dark:text-goldAccent" />
                  <p className="text-xs font-bold font-playfair uppercase tracking-widest">Verification Queue Clear!</p>
                  <p className="text-[10px] text-darktext/50 mt-1">All registered vendors are currently verified and active.</p>
                </div>
              )}
              {!pendingLoading && pendingVendors.map((vendor) => (
                <div key={vendor._id} className="p-5 rounded-2xl bg-cream/15 dark:bg-darkbg/25 border border-rosegold/10 dark:border-goldAccent/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-darktext dark:text-white text-sm font-playfair">{vendor.businessName}</h4>
                    <p className="text-darktext/75 dark:text-gray-400 mt-1">{vendor.vendorType} • {vendor.location} • {vendor.experience} Experience</p>
                    <p className="text-[10px] text-darktext/50 mt-0.5">Email: {vendor.name?.email || 'N/A'} • Phone: {vendor.name?.phoneNo || 'N/A'}</p>
                  </div>
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <button
                      onClick={() => approveVendorMutation.mutate({ vendorId: vendor._id, isApproved: true })}
                      className="flex-1 md:flex-none px-4 py-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-[10px] uppercase tracking-wider rounded-xl shadow transition-transform duration-300 hover:scale-[1.03]"
                    >
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => approveVendorMutation.mutate({ vendorId: vendor._id, isApproved: false })}
                      className="flex-1 md:flex-none px-4 py-2 border border-rosegold/30 hover:bg-rosegold/10 text-rosegold font-semibold text-[10px] uppercase tracking-wider rounded-xl transition-colors"
                    >
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GLOBAL BROADCAST TAB */}
          {activeTab === 'broadcast' && (
            <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm max-w-xl mx-auto space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 font-playfair">Global System Alert Broadcast</h3>
              <form onSubmit={handleBroadcast} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-darktext/70 dark:text-gray-400 tracking-widest uppercase block">Alert Message</label>
                  <textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Enter system announcement (e.g. Schedule server maintenance or platform-wide updates)..."
                    rows={4}
                    required
                    className="w-full bg-cream/10 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-xl p-3 text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/10 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={broadcastMutation.isPending}
                  className="w-full py-3 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black uppercase font-bold tracking-widest rounded-xl transition-all shadow hover:scale-[1.01]"
                >
                  {broadcastMutation.isPending ? "Dispatching Alert..." : "Broadcast Alert to Registry"}
                </button>
              </form>
            </div>
          )}

          {/* HOMEPAGE CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="space-y-8">
              {/* FAQ Curation */}
              <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 font-playfair">Manage Homepage FAQs</h3>
                
                {/* Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createFaqMutation.mutate(faqForm);
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Question</label>
                    <input
                      type="text"
                      value={faqForm.question}
                      onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                      required
                      placeholder="e.g. What is escrow protection?"
                      className="w-full bg-cream/10 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-xl p-2.5 text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Answer</label>
                    <input
                      type="text"
                      value={faqForm.answer}
                      onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                      required
                      placeholder="Answer details..."
                      className="w-full bg-cream/10 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-xl p-2.5 text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/10"
                    />
                  </div>
                  <button
                    type="submit"
                    className="md:col-span-2 py-2.5 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-wider hover:scale-[1.01] transition-all"
                  >
                    Add FAQ Item
                  </button>
                </form>

                {/* List */}
                <div className="space-y-2.5 pt-4 border-t border-rosegold/10">
                  {faqsList.map((faq) => (
                    <div key={faq._id} className="p-3 bg-cream/15 dark:bg-darkbg/25 rounded-xl border border-rosegold/10 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold font-playfair text-darktext dark:text-white">Q: {faq.question}</p>
                        <p className="text-darktext/65 mt-1 font-light">A: {faq.answer}</p>
                      </div>
                      <button
                        onClick={() => deleteFaqMutation.mutate(faq._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial Curation */}
              <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 font-playfair">Manage Homepage Testimonials</h3>
                
                {/* Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createTestMutation.mutate(testForm);
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Couple / Client Name</label>
                    <input
                      type="text"
                      value={testForm.clientName}
                      onChange={(e) => setTestForm({...testForm, clientName: e.target.value})}
                      required
                      placeholder="e.g. Sarah & David"
                      className="w-full bg-cream/10 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-xl p-2.5 text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/10"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Review Text</label>
                    <input
                      type="text"
                      value={testForm.reviewText}
                      onChange={(e) => setTestForm({...testForm, reviewText: e.target.value})}
                      required
                      placeholder="Review details..."
                      className="w-full bg-cream/10 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-xl p-2.5 text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/10"
                    />
                  </div>
                  <button
                    type="submit"
                    className="md:col-span-3 py-2.5 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-wider hover:scale-[1.01] transition-all"
                  >
                    Add Testimonial Item
                  </button>
                </form>

                {/* List */}
                <div className="space-y-2.5 pt-4 border-t border-rosegold/10">
                  {testimonialsList.map((test) => (
                    <div key={test._id} className="p-3 bg-cream/15 dark:bg-darkbg/25 rounded-xl border border-rosegold/10 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold font-playfair text-darktext dark:text-white">{test.clientName}</p>
                        <p className="text-darktext/65 mt-1 font-light italic">"{test.reviewText}"</p>
                      </div>
                      <button
                        onClick={() => deleteTestMutation.mutate(test._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Curation */}
              <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 font-playfair">Manage Homepage Gallery</h3>
                
                {/* Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createGalleryMutation.mutate(galleryForm);
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold"
                >
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Image URL</label>
                    <input
                      type="text"
                      value={galleryForm.imageUrl}
                      onChange={(e) => setGalleryForm({...galleryForm, imageUrl: e.target.value})}
                      required
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-cream/10 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-xl p-2.5 text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Title</label>
                    <input
                      type="text"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                      required
                      placeholder="e.g. Royal Sunset Mandap"
                      className="w-full bg-cream/10 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-xl p-2.5 text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/10"
                    />
                  </div>
                  <button
                    type="submit"
                    className="md:col-span-3 py-2.5 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-wider hover:scale-[1.01] transition-all"
                  >
                    Add Gallery Item
                  </button>
                </form>

                {/* List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t border-rosegold/10">
                  {galleryList.map((item) => (
                    <div key={item._id} className="relative rounded-2xl overflow-hidden group aspect-square shadow border border-rosegold/10">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                        <span className="text-[8px] font-bold uppercase tracking-widest">{item.category}</span>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-bold truncate max-w-[100px] font-playfair">{item.title}</p>
                          <button
                            onClick={() => deleteGalleryMutation.mutate(item._id)}
                            className="p-1 bg-rose-500 rounded text-white hover:bg-rose-600 transition-colors"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'audit' && (
            <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 font-playfair">Operations Audit Trail</h3>
              {auditLoading && <p className="text-xs text-darktext/60 dark:text-gray-400 py-4 text-center">Loading logs...</p>}
              {!auditLoading && auditLogs.length === 0 && <p className="text-xs text-darktext/60 dark:text-gray-400 py-4 text-center">No actions logged yet.</p>}
              {!auditLoading && auditLogs.length > 0 && (
                <div className="space-y-4 font-semibold text-xs">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="p-4 bg-cream/10 dark:bg-darkbg/25 rounded-xl border border-rosegold/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] text-rosegold bg-rosegold/10 border border-rosegold/20 px-2 py-0.5 rounded font-bold uppercase tracking-widest">{log.action}</span>
                        <p className="text-darktext dark:text-gray-300 font-medium mt-1 font-light">{log.details}</p>
                      </div>
                      <div className="text-right text-[10px] text-darktext/50">
                        <p>Actor: {log.actor?.name} ({log.actor?.role})</p>
                        <p className="mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
