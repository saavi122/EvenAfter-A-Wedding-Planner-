import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiDollarSign, FiEdit2, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const ClientProfilePage = () => {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  // 1. Fetch Client Profile details
  const { data: profileResponse, isLoading, error } = useQuery({
    queryKey: ['clientProfile'],
    queryFn: async () => {
      const res = await fetch('/api/client/profile');
      if (!res.ok) throw new Error('Failed to load profile details');
      return res.json();
    }
  });

  const clientProfile = profileResponse?.data;

  // Edit Form Fields state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    profilePhoto: '',
    partnerName: '',
    weddingDate: '',
    location: '',
    budget: '',
    EventIdName: ''
  });

  // Populate form fields on edit open
  const handleOpenEdit = () => {
    if (!clientProfile) return;
    const userObj = clientProfile.name || clientProfile.userId || {};
    
    setFormData({
      name: userObj.name || '',
      phone: userObj.phoneNo || '',
      address: clientProfile.address || '',
      profilePhoto: clientProfile.profilePhoto || '',
      partnerName: clientProfile.partnerName || '',
      weddingDate: clientProfile.weddingDate ? new Date(clientProfile.weddingDate).toISOString().split('T')[0] : '',
      location: clientProfile.location || '',
      budget: clientProfile.budget || 0,
      EventIdName: clientProfile.EventIdName || ''
    });
    setIsEditOpen(true);
  };

  // 2. Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to update profile');
      return result.data;
    },
    onSuccess: (data) => {
      showToast("Profile details updated successfully!", "success");
      setIsEditOpen(false);
      
      // Invalidate queries to reload
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      // Update global context session
      refreshUser();
    },
    onError: (err) => {
      showToast(err.message || "Error updating profile details", "error");
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase font-roboto">Loading portfolio profile...</p>
        </div>
      </div>
    );
  }

  if (error || !clientProfile) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold">Failed to load profile details</h3>
        <p className="text-xs text-slate-500 mt-2">Make sure database server and session cookie are active.</p>
      </div>
    );
  }

  const userObj = clientProfile.name || clientProfile.userId || {};

  return (
    <div className="space-y-8 pb-20 relative">
      
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

      {/* Profile Header Block */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-rosegold/20 dark:border-goldAccent/15 bg-white dark:bg-darkcard">
        
        {/* Cover Photo */}
        <div className="h-[180px] md:h-[240px] w-full relative bg-cream/40 dark:bg-darkbg">
          <img
            src={clientProfile.coverPhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200"}
            alt="Wedding Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Profile info overlay */}
        <div className="relative px-6 pb-6 pt-16 md:pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 md:mt-0 md:-translate-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <img
              src={clientProfile.profilePhoto || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256"}
              alt={userObj.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-darkcard shadow-2xl relative z-10 bg-white"
            />
            <div className="space-y-1 z-10">
              <span className="text-[9px] font-bold text-accent bg-accent/15 px-3 py-0.5 rounded-full border border-accent/20">
                Premium Client
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {userObj.name}
              </h2>
              <p className="text-xs text-slate-500 font-bold dark:text-slate-400">
                {clientProfile.EventIdName || "Sarah & David's Royal Wedding"}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-[10.5px] font-semibold text-slate-500">
                <span className="flex items-center">
                  <FiMapPin className="mr-1 text-accent" />
                  {clientProfile.location || "Mumbai"}
                </span>
                <span>•</span>
                <span>Wedding Status: <strong className="text-accent">{clientProfile.weddingStatus}</strong></span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={handleOpenEdit}
            className="px-5 py-3 rounded-2xl bg-cream hover:bg-accent hover:text-white dark:bg-darkbg/50 dark:hover:bg-accent text-slate-700 dark:text-slate-200 text-xs font-bold shadow transition-all flex items-center justify-center space-x-1.5 self-center md:self-auto"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

      </div>

      {/* Profile Details Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core Profile Info */}
        <div className="glass-card border border-rosegold/20 dark:border-goldAccent/15 p-6 rounded-3xl space-y-6">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-rosegold/10 dark:border-goldAccent/10 pb-2">
            Personal Information
          </h3>

          <div className="space-y-4">
            
            {/* Email */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-cream/50 dark:bg-darkbg text-accent">
                <FiMail className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{userObj.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-cream/50 dark:bg-darkbg text-accent">
                <FiPhone className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Phone Number</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">+91 {userObj.phoneNo}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-cream/50 dark:bg-darkbg text-accent">
                <FiMapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Home Address</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {clientProfile.address || "Not specified yet"}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-cream/50 dark:bg-darkbg text-accent">
                <FiInfo className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Account Created</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {new Date(userObj.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Wedding Preferences */}
        <div className="glass-card border border-rosegold/20 dark:border-goldAccent/15 p-6 rounded-3xl space-y-6">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-rosegold/10 dark:border-goldAccent/10 pb-2">
            Wedding Configuration
          </h3>

          <div className="space-y-4">
            
            {/* Partner Name */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-cream/50 dark:bg-darkbg text-accent">
                <FiUser className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Partner Name</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {clientProfile.partnerName || "Not specified yet"}
                </p>
              </div>
            </div>

            {/* Wedding Date */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-cream/50 dark:bg-darkbg text-accent">
                <FiCalendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Wedding Date</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {clientProfile.weddingDate ? new Date(clientProfile.weddingDate).toLocaleDateString() : "Not decided yet"}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-cream/50 dark:bg-darkbg text-accent">
                <FiMapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Ceremony City / Destination</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {clientProfile.location || "Not decided yet"}
                </p>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-cream/50 dark:bg-darkbg text-accent">
                <FiDollarSign className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Overall Budget Allocation</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {clientProfile.budget ? `${clientProfile.budget.toLocaleString()} INR` : "Not specified yet"}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                    Edit Profile Details
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Configure your personal and wedding preferences</p>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1.5 rounded-full hover:bg-cream dark:hover:bg-darkbg/50 text-slate-400"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                
                {/* Name */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Home Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Profile Photo */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Profile Photo URL</label>
                  <input
                    type="text"
                    value={formData.profilePhoto}
                    onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white text-[11px]"
                  />
                </div>

                <div className="border-t border-slate-200/40 dark:border-slate-800/40 my-4 pt-4" />

                {/* Event Name */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Wedding Event Title</label>
                  <input
                    type="text"
                    value={formData.EventIdName}
                    onChange={(e) => setFormData({ ...formData, EventIdName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                    placeholder="Sarah & David's Royal Wedding"
                  />
                </div>

                {/* Partner Name */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Partner Full Name</label>
                  <input
                    type="text"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Wedding Date */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Wedding Date</label>
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Wedding City</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-wider text-slate-500">Allocated Budget (INR)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-accent to-primary text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}</span>
                </motion.button>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ClientProfilePage;
