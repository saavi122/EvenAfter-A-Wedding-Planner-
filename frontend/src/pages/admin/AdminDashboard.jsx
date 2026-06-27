import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiShield, FiTrendingUp, FiActivity, FiCheck, FiX, 
  FiMail, FiPhone, FiTrash2, FiMessageSquare, FiCheckCircle, FiHeart, FiGift, FiAward, FiSettings,
  FiDollarSign, FiPrinter, FiDownload, FiSearch
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import weddingSetupImage from '../../assets/luxury_wedding_setup.png';

const formatINR = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

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

  // Billing tab states
  const [editingUserId, setEditingUserId] = useState(null);
  const [overrideForm, setOverrideForm] = useState({ plan: 'Free', subscriptionStatus: 'active', durationDays: 30 });
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('All');
  const [billingSubTab, setBillingSubTab] = useState('invoices'); // 'invoices' or 'subscriptions'

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

  // Fetch all admin invoices
  const { data: adminInvoicesResponse, isLoading: adminInvoicesLoading } = useQuery({
    queryKey: ['adminInvoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices/admin');
      if (!res.ok) throw new Error('Failed to load admin invoices');
      return res.json();
    }
  });
  const adminInvoices = adminInvoicesResponse?.data || [];

  // Fetch billing analytics
  const { data: billingAnalyticsResponse, isLoading: billingAnalyticsLoading } = useQuery({
    queryKey: ['billingAnalytics'],
    queryFn: async () => {
      const res = await fetch('/api/invoices/analytics');
      if (!res.ok) throw new Error('Failed to load billing analytics');
      return res.json();
    }
  });
  const billingAnalytics = billingAnalyticsResponse?.data || {};

  // Mutation to override user subscription plan
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, plan, subscriptionStatus, durationDays }) => {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, subscriptionStatus, durationDays })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to update subscription');
      return result.data;
    },
    onSuccess: () => {
      showToast("Subscription plan overridden successfully!", "success");
      setEditingUserId(null);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['billingAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['adminInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
    onError: (err) => {
      showToast(err.message || "Failed to override subscription", "error");
    }
  });

  const exportToCSV = (data) => {
    if (!data || data.length === 0) return;
    const headers = ["Invoice Number", "User Name", "Email", "Plan", "Amount Paid", "GST", "Total Amount", "Payment Method", "Date"];
    const rows = data.map(inv => [
      inv.invoiceNumber,
      inv.userName,
      inv.userEmail,
      inv.planName,
      inv.amountPaid,
      inv.gst,
      inv.totalAmount,
      inv.paymentMethod,
      new Date(inv.createdAt).toLocaleDateString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EvenAfter_Invoices_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintInvoice = (inv) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${inv.invoiceNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #4A403A; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); font-size: 16px; color: #555; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C9A27E; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 26px; font-weight: bold; color: #C9A27E; font-family: Georgia, serif; }
            .title { font-size: 28px; font-weight: bold; text-align: right; color: #4A403A; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .details-block h4 { margin: 0 0 8px 0; color: #C9A27E; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .details-block p { margin: 0 0 5px 0; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th { background: #FAF7F2; color: #4A403A; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .table th, .table td { border: 1px solid #eee; padding: 12px; text-align: left; }
            .table td { font-size: 14px; }
            .totals { float: right; width: 300px; margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .totals-row.grand-total { border-top: 2px double #C9A27E; font-size: 18px; font-weight: bold; color: #C9A27E; padding-top: 12px; }
            .footer { text-align: center; margin-top: 80px; font-size: 11px; opacity: 0.6; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">EvenAfter</div>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Premium Wedding Planner & Vendor Network</p>
              </div>
              <div class="title">INVOICE</div>
            </div>
            <div class="details-grid">
              <div class="details-block">
                <h4>Invoice Info</h4>
                <p><strong>Invoice No:</strong> \${inv.invoiceNumber}</p>
                <p><strong>Date & Time:</strong> \${new Date(inv.createdAt).toLocaleString()}</p>
                <p><strong>Payment Status:</strong> <span style="color: #10B981; font-weight: bold;">PAID</span></p>
              </div>
              <div class="details-block" style="text-align: right;">
                <h4>Billed To</h4>
                <p><strong>Name:</strong> \${inv.userName}</p>
                <p><strong>Phone:</strong> \${inv.userPhone}</p>
                <p><strong>Email:</strong> \${inv.userEmail}</p>
              </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Payment Method</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>\${inv.planName} Subscription Plan Activation</td>
                  <td>\${inv.paymentMethod.toUpperCase()}</td>
                  <td style="text-align: right;">₹\${new Intl.NumberFormat('en-IN').format(inv.amountPaid)}</td>
                </tr>
              </tbody>
            </table>
            <div style="width: 100%; overflow: hidden;">
              <div class="totals">
                <div class="totals-row">
                  <span>Subtotal</span>
                  <span>₹\${new Intl.NumberFormat('en-IN').format(inv.amountPaid)}</span>
                </div>
                <div class="totals-row">
                  <span>GST (18%)</span>
                  <span>₹\${new Intl.NumberFormat('en-IN').format(inv.gst)}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>Grand Total</span>
                  <span>₹\${new Intl.NumberFormat('en-IN').format(inv.totalAmount)}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>This is a computer generated invoice and does not require a physical signature.</p>
              <p>For any billing support, please reach out to support@evenafter.com</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
          { id: 'billing', label: 'Billing & Subscriptions' },
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

          {/* BILLING & SUBSCRIPTIONS TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-8 animate-fadeIn text-xs">
              
              {/* Revenue Stats & Plan breakdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-5 flex items-center space-x-4 shadow-sm">
                  <div className="p-3 rounded-2xl text-emerald-600 bg-emerald-500/10 flex-shrink-0">
                    <FiTrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-darktext/60 dark:text-gray-400">Total Platform Revenue</p>
                    <h3 className="text-xl font-bold font-playfair text-darktext dark:text-goldAccent mt-0.5">
                      ₹{formatINR(billingAnalytics.totalRevenue || 0)}
                    </h3>
                    <p className="text-[10px] text-darktext/50 font-semibold mt-0.5">Sum of all payments</p>
                  </div>
                </div>

                <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-5 flex items-center space-x-4 shadow-sm">
                  <div className="p-3 rounded-2xl text-amber-600 bg-amber-500/10 flex-shrink-0">
                    <FiShield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-darktext/60 dark:text-gray-400">Active Paid Subscriptions</p>
                    <h3 className="text-xl font-bold font-playfair text-darktext dark:text-goldAccent mt-0.5">
                      {billingAnalytics.activePaidSubscriptionsCount || 0}
                    </h3>
                    <p className="text-[10px] text-darktext/50 font-semibold mt-0.5">Paid accounts active</p>
                  </div>
                </div>

                <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-5 flex items-center space-x-4 shadow-sm">
                  <div className="p-3 rounded-2xl text-rosegold bg-rosegold/10 flex-shrink-0">
                    <FiUsers className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-darktext/60 dark:text-gray-400">Total Transactions</p>
                    <h3 className="text-xl font-bold font-playfair text-darktext dark:text-goldAccent mt-0.5">
                      {billingAnalytics.totalInvoicesCount || 0}
                    </h3>
                    <p className="text-[10px] text-darktext/50 font-semibold mt-0.5">Invoices recorded</p>
                  </div>
                </div>

                <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-5 flex flex-col justify-center shadow-sm">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-darktext/60 dark:text-gray-400 mb-1">Paid Plan Breakdowns</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-darktext/75 dark:text-gray-400 font-mono">
                    <div>Pro Planners: <span className="font-bold text-rosegold dark:text-goldAccent">{billingAnalytics.planBreakdown?.['Pro Planner'] || 0}</span></div>
                    <div>Premium Planners: <span className="font-bold text-rosegold dark:text-goldAccent">{billingAnalytics.planBreakdown?.['Premium Planner'] || 0}</span></div>
                    <div>Pro Vendors: <span className="font-bold text-rosegold dark:text-goldAccent">{billingAnalytics.planBreakdown?.['Vendor Pro'] || 0}</span></div>
                    <div>Elite Vendors: <span className="font-bold text-rosegold dark:text-goldAccent">{billingAnalytics.planBreakdown?.['Vendor Elite'] || 0}</span></div>
                  </div>
                </div>
              </div>

              {/* Sub tabs inside Billing */}
              <div className="flex space-x-2 border-b border-rosegold/10 pb-2">
                <button
                  onClick={() => setBillingSubTab('invoices')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    billingSubTab === 'invoices'
                      ? 'bg-rosegold dark:bg-goldAccent text-white dark:text-black'
                      : 'bg-cream/20 text-darktext/75 dark:text-gray-400 hover:bg-cream/45'
                  }`}
                >
                  Transaction Logs
                </button>
                <button
                  onClick={() => setBillingSubTab('subscriptions')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    billingSubTab === 'subscriptions'
                      ? 'bg-rosegold dark:bg-goldAccent text-white dark:text-black'
                      : 'bg-cream/20 text-darktext/75 dark:text-gray-400 hover:bg-cream/45'
                  }`}
                >
                  Active Subscriptions & Overrides
                </button>
              </div>

              {/* TAB 1: TRANSACTION INVOICE LOGS */}
              {billingSubTab === 'invoices' && (
                <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair">
                      Platform Invoice Registry
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        placeholder="Search invoices, emails, names..."
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                        className="px-3 py-1.5 bg-cream/15 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-lg text-[10px] outline-none text-darktext dark:text-white focus:border-rosegold"
                      />
                      <select
                        value={invoiceFilterStatus}
                        onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                        className="px-3 py-1.5 bg-cream/15 dark:bg-darkbg/35 border border-rosegold/20 dark:border-goldAccent/25 rounded-lg text-[10px] outline-none text-darktext dark:text-white"
                      >
                        <option value="All">All Invoices</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                      <button
                        onClick={() => exportToCSV(adminInvoices)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rosegold/10 border border-rosegold/20 text-rosegold hover:bg-rosegold/15 rounded-lg font-bold uppercase tracking-wider text-[9px]"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {adminInvoicesLoading ? (
                    <p className="text-center py-8 opacity-65">Loading invoice registry...</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-rosegold/15 opacity-60 text-[9px] uppercase font-bold tracking-wider">
                            <th className="py-2.5 px-2">Invoice No</th>
                            <th className="py-2.5 px-2">Billed To</th>
                            <th className="py-2.5 px-2">Email</th>
                            <th className="py-2.5 px-2">Plan Details</th>
                            <th className="py-2.5 px-2">Amount Paid</th>
                            <th className="py-2.5 px-2">Method</th>
                            <th className="py-2.5 px-2">Date</th>
                            <th className="py-2.5 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminInvoices
                            .filter(inv => {
                              const searchLower = invoiceSearch.toLowerCase();
                              const matchesSearch = 
                                inv.invoiceNumber.toLowerCase().includes(searchLower) ||
                                inv.userName.toLowerCase().includes(searchLower) ||
                                inv.userEmail.toLowerCase().includes(searchLower) ||
                                inv.planName.toLowerCase().includes(searchLower);
                              const matchesStatus = invoiceFilterStatus === 'All' || inv.paymentStatus === invoiceFilterStatus;
                              return matchesSearch && matchesStatus;
                            })
                            .map((inv) => (
                              <tr key={inv._id} className="border-b border-rosegold/5 hover:bg-cream/5 transition-colors text-[11px]">
                                <td className="py-3 px-2 font-mono font-bold">{inv.invoiceNumber}</td>
                                <td className="py-3 px-2 font-semibold font-playfair text-darktext dark:text-white">{inv.userName}</td>
                                <td className="py-3 px-2 text-darktext/70 dark:text-gray-400">{inv.userEmail}</td>
                                <td className="py-3 px-2 font-semibold text-rosegold dark:text-goldAccent">{inv.planName}</td>
                                <td className="py-3 px-2 font-bold">₹{formatINR(inv.totalAmount)}</td>
                                <td className="py-3 px-2 font-mono uppercase text-[9px]">{inv.paymentMethod}</td>
                                <td className="py-3 px-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 px-2 text-right">
                                  <button
                                    onClick={() => handlePrintInvoice(inv)}
                                    className="inline-flex items-center gap-1 text-rosegold dark:text-goldAccent hover:underline font-bold uppercase tracking-wider text-[9px]"
                                  >
                                    <FiPrinter className="w-3.5 h-3.5" />
                                    <span>Print Receipt</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {adminInvoices.length === 0 && (
                            <tr>
                              <td colSpan="8" className="py-8 text-center opacity-60 font-light">
                                No invoice records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACTIVE PAID ACCOUNTS & OVERRIDES */}
              {billingSubTab === 'subscriptions' && (
                <div className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair mb-1">
                      Active Paid Subscriptions & Plan Overrides
                    </h3>
                    <p className="text-[10px] text-darktext/50">
                      Manage active premium memberships or manually override any user's plan.
                    </p>
                  </div>

                  {billingAnalyticsLoading ? (
                    <p className="text-center py-8 opacity-65">Loading subscription data...</p>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Subscription Overrides Form */}
                      {editingUserId ? (
                        <div className="p-4 rounded-2xl bg-cream/15 dark:bg-darkbg/35 border border-rosegold/15 dark:border-goldAccent/10 space-y-4 max-w-lg">
                          <div className="flex justify-between items-center pb-2 border-b border-rosegold/10">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-rosegold dark:text-goldAccent">
                              Overriding Subscription Plan
                            </span>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="text-darktext/60 hover:text-rosegold font-bold uppercase text-[9px]"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Target Plan</label>
                              <select
                                value={overrideForm.plan}
                                onChange={(e) => setOverrideForm({...overrideForm, plan: e.target.value})}
                                className="w-full bg-white dark:bg-darkbg border border-rosegold/20 dark:border-goldAccent/25 rounded p-2 text-xs"
                              >
                                <option value="Free">Free</option>
                                <option value="Pro Planner">Pro Planner (Planner)</option>
                                <option value="Premium Planner">Premium Planner (Planner)</option>
                                <option value="Vendor Pro">Vendor Pro (Vendor)</option>
                                <option value="Vendor Elite">Vendor Elite (Vendor)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Status</label>
                              <select
                                value={overrideForm.subscriptionStatus}
                                onChange={(e) => setOverrideForm({...overrideForm, subscriptionStatus: e.target.value})}
                                className="w-full bg-white dark:bg-darkbg border border-rosegold/20 dark:border-goldAccent/25 rounded p-2 text-xs"
                              >
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider text-darktext/60 block font-bold">Duration (Days)</label>
                              <input
                                type="number"
                                value={overrideForm.durationDays}
                                onChange={(e) => setOverrideForm({...overrideForm, durationDays: e.target.value})}
                                disabled={overrideForm.plan === 'Free'}
                                className="w-full bg-white dark:bg-darkbg border border-rosegold/20 dark:border-goldAccent/25 rounded p-2 text-xs disabled:opacity-50"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              updateSubscriptionMutation.mutate({
                                userId: editingUserId,
                                ...overrideForm
                              });
                            }}
                            className="w-full py-2 bg-rosegold dark:bg-goldAccent text-white dark:text-black uppercase font-bold tracking-widest rounded-xl transition-all shadow hover:scale-[1.01]"
                          >
                            Apply Subscription Override
                          </button>
                        </div>
                      ) : null}

                      {/* Subscriptions Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-rosegold/15 opacity-60 text-[9px] uppercase font-bold tracking-wider">
                              <th className="py-2.5 px-2">Subscriber</th>
                              <th className="py-2.5 px-2">Email</th>
                              <th className="py-2.5 px-2">Account Role</th>
                              <th className="py-2.5 px-2">Plan</th>
                              <th className="py-2.5 px-2">Start Date</th>
                              <th className="py-2.5 px-2">End Date</th>
                              <th className="py-2.5 px-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users
                              .filter(u => u.plan && u.plan !== 'Free')
                              .map((u) => (
                                <tr key={u._id} className="border-b border-rosegold/5 hover:bg-cream/5 transition-colors text-[11px]">
                                  <td className="py-3 px-2 font-semibold font-playfair text-darktext dark:text-white">{u.name}</td>
                                  <td className="py-3 px-2 text-darktext/70 dark:text-gray-400">{u.email}</td>
                                  <td className="py-3 px-2 capitalize">
                                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${getRoleBadge(u.role)}`}>
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 font-bold text-rosegold dark:text-goldAccent">{u.plan}</td>
                                  <td className="py-3 px-2">
                                    {u.planStartDate ? new Date(u.planStartDate).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="py-3 px-2">
                                    {u.planEndDate ? new Date(u.planEndDate).toLocaleDateString() : 'Never'}
                                  </td>
                                  <td className="py-3 px-2 text-right">
                                    <button
                                      onClick={() => {
                                        setEditingUserId(u._id);
                                        setOverrideForm({
                                          plan: u.plan,
                                          subscriptionStatus: u.subscriptionStatus || 'active',
                                          durationDays: 30
                                        });
                                      }}
                                      className="px-3 py-1 bg-rosegold/10 border border-rosegold/20 text-rosegold hover:bg-rosegold/15 rounded-lg font-bold uppercase tracking-wider text-[9px]"
                                    >
                                      Override Plan
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            {users.filter(u => u.plan && u.plan !== 'Free').length === 0 && (
                              <tr>
                                <td colSpan="7" className="py-8 text-center opacity-60 font-light">
                                  No active paid plan subscribers at this time.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Quick override user database list */}
                      <div className="pt-4 border-t border-rosegold/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair mb-3">
                          Quick Plan Override (Free Users Database)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {users
                            .filter(u => u.plan === 'Free' || !u.plan)
                            .slice(0, 10)
                            .map((u) => (
                              <div key={u._id} className="p-3 bg-cream/5 border border-rosegold/10 rounded-xl flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-darktext dark:text-white">{u.name}</span>
                                  <p className="text-[10px] text-darktext/50">{u.email} • Role: {u.role}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingUserId(u._id);
                                    setOverrideForm({
                                      plan: u.role === 'planner' ? 'Pro Planner' : 'Vendor Pro',
                                      subscriptionStatus: 'active',
                                      durationDays: 30
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-cream/40 border border-rosegold/20 text-[9px] font-bold uppercase tracking-wider rounded"
                                >
                                  Grant Paid Plan
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

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
