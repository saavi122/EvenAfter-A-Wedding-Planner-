import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  FiCheck, FiX, FiCalendar, FiMessageSquare, FiUsers, FiClock, 
  FiActivity, FiMapPin, FiBriefcase, FiDollarSign, FiTrash2, FiStar,
  FiPrinter, FiDownload, FiShield
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export const VendorDashboard = () => {
  const { user, profile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vendorTab, setVendorTab] = useState('Overview');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('All');

  // Fetch Vendor profile me
  const { data: profileMeResponse } = useQuery({
    queryKey: ['vendorProfileMe'],
    queryFn: async () => {
      const res = await fetch('/api/vendors/profile/me');
      if (!res.ok) throw new Error('Failed to fetch vendor profile');
      return res.json();
    },
    enabled: vendorTab === 'My Profile'
  });
  const vendorProfile = profileMeResponse?.data;

  // Fetch Vendor analytics
  const { data: analyticsResponse } = useQuery({
    queryKey: ['vendorAnalytics'],
    queryFn: async () => {
      const res = await fetch('/api/vendors/analytics/stats');
      if (!res.ok) throw new Error('Failed to fetch vendor analytics');
      return res.json();
    },
    enabled: vendorTab === 'My Profile'
  });
  const analytics = analyticsResponse?.data || { profileViews: 0, quoteRequests: 0, bookingRequests: 0, averageRating: 5.0 };

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phoneNo: '',
    businessName: '',
    description: '',
    location: '',
    workingAreas: '',
    servicesOffered: '',
    vendorLogo: '',
    coverImage: '',
    experience: '',
    vendorType: 'Florist',
    instagram: '',
    facebook: '',
    linkedin: '',
    basicName: 'Basic Package',
    basicPrice: '',
    basicDescription: '',
    standardName: 'Standard Package',
    standardPrice: '',
    standardDescription: '',
    premiumName: 'Premium Package',
    premiumPrice: '',
    premiumDescription: '',
  });

  const [eventForm, setEventForm] = useState({
    name: '',
    eventType: 'Wedding',
    plannerName: '',
    location: '',
    date: '',
    clientRating: 5,
    images: ''
  });

  useEffect(() => {
    if (vendorProfile) {
      setProfileForm({
        name: vendorProfile.name?.name || vendorProfile.userId?.name || '',
        email: vendorProfile.name?.email || vendorProfile.userId?.email || '',
        phoneNo: vendorProfile.name?.phoneNo || vendorProfile.userId?.phoneNo || '',
        businessName: vendorProfile.businessName || '',
        description: vendorProfile.description || '',
        location: vendorProfile.location || '',
        workingAreas: vendorProfile.workingAreas?.join(', ') || '',
        servicesOffered: vendorProfile.servicesOffered?.join(', ') || '',
        vendorLogo: vendorProfile.vendorLogo || '',
        coverImage: vendorProfile.coverImage || '',
        experience: vendorProfile.experience || '',
        vendorType: vendorProfile.vendorType || 'Florist',
        instagram: vendorProfile.socialLinks?.instagram || '',
        facebook: vendorProfile.socialLinks?.facebook || '',
        linkedin: vendorProfile.socialLinks?.linkedin || '',
        basicName: vendorProfile.packages?.basic?.name || 'Basic Package',
        basicPrice: vendorProfile.packages?.basic?.price || '',
        basicDescription: vendorProfile.packages?.basic?.description || '',
        standardName: vendorProfile.packages?.standard?.name || 'Standard Package',
        standardPrice: vendorProfile.packages?.standard?.price || '',
        standardDescription: vendorProfile.packages?.standard?.description || '',
        premiumName: vendorProfile.packages?.premium?.name || 'Premium Package',
        premiumPrice: vendorProfile.packages?.premium?.price || '',
        premiumDescription: vendorProfile.packages?.premium?.description || '',
      });
    }
  }, [vendorProfile]);

  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const res = await fetch('/api/vendors/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to add event');
      return result.data;
    },
    onSuccess: () => {
      toast.success("Past event added to portfolio!");
      setEventForm({
        name: '',
        eventType: 'Wedding',
        plannerName: '',
        location: '',
        date: '',
        clientRating: 5,
        images: ''
      });
      queryClient.invalidateQueries({ queryKey: ['vendorProfileMe'] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add event");
    }
  });

  // Fetch personal invoices
  const { data: invoicesResponse } = useQuery({
    queryKey: ['myInvoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices/my');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    }
  });

  const invoices = invoicesResponse?.data || [];

  const handleToggleAutoRenew = async () => {
    try {
      const response = await fetch('/api/auth/toggle-autorenew', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.data.autoRenew ? "Auto-renewal enabled" : "Auto-renewal disabled");
        await refreshUser();
      } else {
        throw new Error(data.message || "Failed to toggle auto-renew");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update settings");
    }
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
                <p><strong>Invoice No:</strong> ${inv.invoiceNumber}</p>
                <p><strong>Date & Time:</strong> ${new Date(inv.createdAt).toLocaleString()}</p>
                <p><strong>Payment Status:</strong> <span style="color: #10B981; font-weight: bold;">PAID</span></p>
              </div>
              <div class="details-block" style="text-align: right;">
                <h4>Billed To</h4>
                <p><strong>Name:</strong> ${inv.userName}</p>
                <p><strong>Phone:</strong> ${inv.userPhone}</p>
                <p><strong>Email:</strong> ${inv.userEmail}</p>
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
                  <td>${inv.planName} Subscription Plan Activation</td>
                  <td>${inv.paymentMethod.toUpperCase()}</td>
                  <td style="text-align: right;">₹${new Intl.NumberFormat('en-IN').format(inv.amountPaid)}</td>
                </tr>
              </tbody>
            </table>
            <div style="width: 100%; overflow: hidden;">
              <div class="totals">
                <div class="totals-row">
                  <span>Subtotal</span>
                  <span>₹${new Intl.NumberFormat('en-IN').format(inv.amountPaid)}</span>
                </div>
                <div class="totals-row">
                  <span>GST (18%)</span>
                  <span>₹${new Intl.NumberFormat('en-IN').format(inv.gst)}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>Grand Total</span>
                  <span>₹${new Intl.NumberFormat('en-IN').format(inv.totalAmount)}</span>
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

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) || 
                          inv.planName.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus = invoiceFilterStatus === 'All' || inv.paymentStatus === invoiceFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatINR = (num) =>
    new Intl.NumberFormat('en-IN').format(Math.round(num));

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
    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_BACKEND_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });

    // Register user session on connect (supports automatic reconnection)
    socket.on("connect", () => {
      socket.emit("joinUser", user._id);
    });

    // Handle connection authentication errors to prevent infinite reconnect loops
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      if (err.message.includes("Authentication error")) {
        socket.disconnect();
      }
    });

    socket.on("notification", (notif) => {
      if (notif.type === "assignment") {
        toast.success(notif.message);
        queryClient.invalidateQueries({ queryKey: ['vendorAssignments'] });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("notification");
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
      queryClient.invalidateQueries({ queryKey: ['vendorProfileMe'] });
      queryClient.invalidateQueries({ queryKey: ['vendorAnalytics'] });
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

      <div className="flex flex-wrap gap-2 border-b border-rosegold/20 dark:border-goldAccent/15 pb-2">
        {['Overview', 'Services & Packages', 'Portfolio Showcase', 'Calendar & Revenue', 'Reviews', 'Billing & Invoices', 'My Profile'].map((tab) => (
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

          {/* BILLING & INVOICES TAB */}
          {vendorTab === 'Billing & Invoices' && (
            <div className="space-y-8 animate-fadeIn text-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Subscription Status Details (7 columns) */}
                <div className="md:col-span-7 space-y-6">
                  <div className="p-5 rounded-2xl bg-cream/15 dark:bg-darkbg/25 border border-rosegold/15 dark:border-goldAccent/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-rosegold dark:text-goldAccent font-bold">Membership Plan</span>
                        <h4 className="text-xl font-bold font-playfair mt-1 text-darktext dark:text-white flex items-center">
                          Current Plan: <span className="text-rosegold dark:text-goldAccent font-semibold ml-1.5">{user?.plan || 'Free'}</span>
                          {user?.plan === 'Vendor Elite' && (
                            <span className="ml-2 inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/25 text-yellow-600 dark:text-goldAccent text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider animate-pulse">
                              <FiShield className="w-2.5 h-2.5" /> Elite
                            </span>
                          )}
                        </h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user?.subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {user?.subscriptionStatus || 'active'}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-rosegold/10 pt-4 text-xs">
                      <div className="flex justify-between">
                        <span className="opacity-60">Start Date:</span>
                        <span className="font-semibold">{user?.planStartDate ? new Date(user.planStartDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Renewal Date:</span>
                        <span className="font-semibold">{user?.planEndDate ? new Date(user.planEndDate).toLocaleDateString() : 'Never'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Renewal Settings:</span>
                        <span className={`font-semibold ${user?.autoRenew !== false ? 'text-emerald-500' : 'text-gray-400'}`}>
                          {user?.autoRenew !== false ? 'Auto-Renew Enabled' : 'Auto-Renew Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* Auto-renew toggle switch for Elite Users */}
                    {user?.plan === 'Vendor Elite' && (
                      <div className="mt-4 pt-4 border-t border-rosegold/10 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-xs text-darktext dark:text-white">Auto-Renewal Settings</span>
                          <p className="text-[9px] opacity-60 mt-0.5">Toggle auto-renewal for this subscription cycle.</p>
                        </div>
                        <button
                          onClick={handleToggleAutoRenew}
                          className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                            user?.autoRenew !== false ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        >
                          <motion.div
                            layout
                            className="bg-white w-4 h-4 rounded-full shadow-md"
                            animate={{ x: user?.autoRenew !== false ? 16 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      {(user?.plan === 'Free' || !user?.plan) ? (
                        <Link
                          to="/pricing"
                          className="px-4 py-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold tracking-wider rounded-lg text-[10px] uppercase shadow-sm"
                        >
                          Upgrade Plan
                        </Link>
                      ) : user?.plan === 'Vendor Pro' ? (
                        <div className="flex flex-wrap gap-3">
                          <Link
                            to="/pricing"
                            className="px-4 py-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold tracking-wider rounded-lg text-[10px] uppercase shadow-sm"
                          >
                            Upgrade to Elite
                          </Link>
                          {invoices.length > 0 && (
                            <button
                              onClick={() => handlePrintInvoice(invoices[0])}
                              className="px-4 py-2 border border-rosegold/30 dark:border-goldAccent/30 text-rosegold dark:text-goldAccent hover:bg-rosegold/5 dark:hover:bg-goldAccent/5 font-semibold tracking-wider rounded-lg text-[10px] uppercase shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <FiPrinter className="w-3.5 h-3.5" />
                              Download Invoice
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-rosegold/30 dark:bg-goldAccent/25 text-white/50 dark:text-black/50 font-semibold tracking-wider rounded-lg text-[10px] uppercase cursor-not-allowed"
                        >
                          Elite Tier Active
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pricing Comparison / Plan Benefits */}
                  <div className="p-5 rounded-2xl bg-cream/15 dark:bg-darkbg/25 border border-rosegold/15 dark:border-goldAccent/10 space-y-4">
                    <h5 className="font-playfair text-sm font-semibold tracking-wide text-rosegold dark:text-goldAccent">
                      Membership Tier Benefits
                    </h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/40 dark:bg-black/15 rounded-xl border border-rosegold/10">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Free Plan</span>
                          <span>₹0</span>
                        </div>
                        <p className="text-[10px] opacity-75 leading-relaxed">
                          Basic business profile, upload up to 10 portfolio images, and receive basic client inquiries.
                        </p>
                      </div>
                      <div className="p-3 bg-white/40 dark:bg-black/15 rounded-xl border border-rosegold/10">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Vendor Pro</span>
                          <span>₹799/month</span>
                        </div>
                        <p className="text-[10px] opacity-75 leading-relaxed">
                          Everything in Free, unlimited portfolio uploads, featured category listing, analytics, and priority lead notifications.
                        </p>
                      </div>
                      <div className="p-3 bg-white/40 dark:bg-black/15 rounded-xl border border-rosegold/10">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Vendor Elite</span>
                          <span>₹1,999/month</span>
                        </div>
                        <p className="text-[10px] opacity-75 leading-relaxed">
                          Everything in Pro, homepage promotions, verified business badge, AI recommendation boost, and dedicated account support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Limits Summary (5 columns) */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-cream/15 dark:bg-darkbg/25 border border-rosegold/15 dark:border-goldAccent/10 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10">
                    Usage Limits
                  </h4>
                  
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between font-medium mb-1.5">
                        <span>Portfolio Uploads</span>
                        <span>{user?.plan === 'Free' ? '0 / 10 images' : 'Unlimited'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-cream/40 dark:bg-darkbg/40 overflow-hidden">
                        <div 
                          className="h-full bg-rosegold dark:bg-goldAccent transition-all duration-300"
                          style={{ width: user?.plan === 'Free' ? '30%' : '100%' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-medium mb-1.5">
                        <span>Featured Listings</span>
                        <span>{user?.plan === 'Free' ? 'Not Available' : 'Active Category Feature'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-cream/40 dark:bg-darkbg/40 overflow-hidden">
                        <div 
                          className="h-full bg-rosegold dark:bg-goldAccent transition-all duration-300"
                          style={{ width: user?.plan === 'Free' ? '0%' : '100%' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-medium mb-1.5">
                        <span>Analytics Dashboard</span>
                        <span>{user?.plan === 'Free' ? 'Basic' : 'Advanced & Leads Analytics'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-cream/40 dark:bg-darkbg/40 overflow-hidden">
                        <div 
                          className="h-full bg-rosegold dark:bg-goldAccent transition-all duration-300"
                          style={{ width: user?.plan === 'Free' ? '15%' : '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Invoices Table Section */}
              <div className="p-5 rounded-2xl bg-cream/15 dark:bg-darkbg/25 border border-rosegold/15 dark:border-goldAccent/10 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 sm:border-0 sm:pb-0">
                    Payment & Invoice History
                  </h4>
                  
                  {/* Search and filter controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search Invoices..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="px-3 py-1.5 bg-white/70 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/25 rounded-lg text-[10px] outline-none text-darktext dark:text-white focus:border-rosegold dark:focus:border-goldAccent"
                    />
                    <select
                      value={invoiceFilterStatus}
                      onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                      className="px-3 py-1.5 bg-white/70 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/25 rounded-lg text-[10px] outline-none text-darktext dark:text-white"
                    >
                      <option value="All">All Invoices</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="border-b border-rosegold/10 opacity-60">
                        <th className="py-2.5">Invoice Number</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Description</th>
                        <th className="py-2.5">Amount</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center opacity-60 font-light">
                            No billing receipts or invoices found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv) => (
                          <tr key={inv._id} className="border-b border-rosegold/5 hover:bg-cream/5">
                            <td className="py-3 font-mono font-bold text-xs">{inv.invoiceNumber}</td>
                            <td className="py-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                            <td className="py-3">{inv.planName} Plan</td>
                            <td className="py-3">₹{formatINR(inv.totalAmount)}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-wider text-[8px] border border-emerald-500/20">
                                {inv.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handlePrintInvoice(inv)}
                                className="inline-flex items-center gap-1 text-rosegold dark:text-goldAccent hover:underline font-bold uppercase tracking-wider text-[8px] cursor-pointer"
                              >
                                <FiPrinter className="w-3.5 h-3.5" />
                                <span>Print Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MY PROFILE TAB */}
          {vendorTab === 'My Profile' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Analytics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="p-5 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Profile Views</span>
                  <div className="text-2xl font-black text-darktext dark:text-goldAccent mt-1 font-playfair">{analytics.profileViews}</div>
                  <span className="text-[9px] text-emerald-500 font-semibold mt-1 block">✦ Realtime metric</span>
                </div>
                <div className="p-5 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Quote Requests</span>
                  <div className="text-2xl font-black text-darktext dark:text-goldAccent mt-1 font-playfair">{analytics.quoteRequests}</div>
                  <span className="text-[9px] text-slate-500 block mt-1">From active clients</span>
                </div>
                <div className="p-5 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Booking Requests</span>
                  <div className="text-2xl font-black text-darktext dark:text-goldAccent mt-1 font-playfair">{analytics.bookingRequests}</div>
                  <span className="text-[9px] text-slate-500 block mt-1">Assignments / Direct hires</span>
                </div>
                <div className="p-5 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Average Rating</span>
                  <div className="text-2xl font-black text-darktext dark:text-goldAccent mt-1 font-playfair flex items-center">
                    <FiStar className="fill-current text-amber-500 mr-1.5 w-5 h-5" />
                    {analytics.averageRating}
                  </div>
                  <span className="text-[9px] text-emerald-500 font-semibold mt-1 block">✦ Verified Reviews</span>
                </div>
              </div>

              {/* Edit Forms Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Edit Profile Form */}
                <div className="p-6 md:p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-playfair uppercase tracking-wider">Edit Public Profile</h3>
                    <p className="text-[10px] text-slate-450 mt-1">Update your professional details and branding assets</p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const workingAreasArray = profileForm.workingAreas.split(',').map(s => s.trim()).filter(Boolean);
                    const servicesOfferedArray = profileForm.servicesOffered.split(',').map(s => s.trim()).filter(Boolean);
                    updateProfileMutation.mutate({
                      name: profileForm.name,
                      email: profileForm.email,
                      phoneNo: profileForm.phoneNo,
                      businessName: profileForm.businessName,
                      description: profileForm.description,
                      location: profileForm.location,
                      workingAreas: workingAreasArray,
                      servicesOffered: servicesOfferedArray,
                      vendorLogo: profileForm.vendorLogo,
                      coverImage: profileForm.coverImage,
                      experience: profileForm.experience,
                      vendorType: profileForm.vendorType,
                      socialLinks: {
                        instagram: profileForm.instagram,
                        facebook: profileForm.facebook,
                        linkedin: profileForm.linkedin
                      },
                      packages: {
                        basic: {
                          name: profileForm.basicName,
                          price: profileForm.basicPrice,
                          description: profileForm.basicDescription
                        },
                        standard: {
                          name: profileForm.standardName,
                          price: profileForm.standardPrice,
                          description: profileForm.standardDescription
                        },
                        premium: {
                          name: profileForm.premiumName,
                          price: profileForm.premiumPrice,
                          description: profileForm.premiumDescription
                        }
                      }
                    });
                  }} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Business/Brand Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.businessName}
                          onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={profileForm.phoneNo}
                          onChange={(e) => setProfileForm({ ...profileForm, phoneNo: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Vendor Category</label>
                        <select
                          value={profileForm.vendorType}
                          onChange={(e) => setProfileForm({ ...profileForm, vendorType: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        >
                          <option value="Florist">Florist</option>
                          <option value="Catering">Catering</option>
                          <option value="Photography">Photography</option>
                          <option value="Videography">Videography</option>
                          <option value="Makeup Artist">Makeup Artist</option>
                          <option value="Mehndi Artist">Mehndi Artist</option>
                          <option value="Choreography">Choreography</option>
                          <option value="Band & DJ">Band & DJ</option>
                          <option value="Decorator">Decorator</option>
                          <option value="Invitations & Gifts">Invitations & Gifts</option>
                          <option value="Transport & Logistics">Transport & Logistics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Experience (e.g. 5 Years)</label>
                        <input
                          type="text"
                          value={profileForm.experience}
                          onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Base Location</label>
                        <input
                          type="text"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Serving Areas (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Mumbai, Pune, Goa"
                          value={profileForm.workingAreas}
                          onChange={(e) => setProfileForm({ ...profileForm, workingAreas: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-slate-400">Services Offered (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Bridal Makeup, Guest Makeup, Hairstyling"
                        value={profileForm.servicesOffered}
                        onChange={(e) => setProfileForm({ ...profileForm, servicesOffered: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-slate-400">About / Brand Description</label>
                      <textarea
                        rows="3"
                        required
                        value={profileForm.description}
                        onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none resize-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Logo/Avatar Image URL</label>
                        <input
                          type="text"
                          value={profileForm.vendorLogo}
                          onChange={(e) => setProfileForm({ ...profileForm, vendorLogo: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Cover Banner Image URL</label>
                        <input
                          type="text"
                          value={profileForm.coverImage}
                          onChange={(e) => setProfileForm({ ...profileForm, coverImage: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="border-t border-rosegold/10 pt-4 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Social Media Links</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block mb-1 text-[9px] uppercase text-slate-400">Instagram</label>
                          <input
                            type="text"
                            placeholder="username"
                            value={profileForm.instagram}
                            onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[9px] uppercase text-slate-400">Facebook</label>
                          <input
                            type="text"
                            placeholder="profile handle"
                            value={profileForm.facebook}
                            onChange={(e) => setProfileForm({ ...profileForm, facebook: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[9px] uppercase text-slate-400">LinkedIn</label>
                          <input
                            type="text"
                            placeholder="company url"
                            value={profileForm.linkedin}
                            onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-extrabold uppercase tracking-widest text-[10px] rounded-xl hover:opacity-90 transition-all shadow"
                    >
                      {updateProfileMutation.isPending ? "Updating profile..." : "Save Profile Details"}
                    </button>
                  </form>
                </div>

                {/* Right Column: Pricing Packages & Portfolio Events */}
                <div className="space-y-8">

                  {/* Pricing Packages Editor */}
                  <div className="p-6 md:p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-playfair uppercase tracking-wider">Pricing & Packages</h3>
                      <p className="text-[10px] text-slate-450 mt-1">Configure pricing packages to attract direct booking/quote requests</p>
                    </div>

                    <div className="space-y-6">
                      {/* Basic Package */}
                      <div className="p-4 rounded-2xl bg-cream/10 border border-rosegold/15 space-y-3">
                        <span className="text-[9px] font-bold text-rosegold dark:text-goldAccent uppercase tracking-widest">Basic Tier</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              placeholder="Package Name"
                              value={profileForm.basicName}
                              onChange={(e) => setProfileForm({ ...profileForm, basicName: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Price (e.g. ₹50,000)"
                              value={profileForm.basicPrice}
                              onChange={(e) => setProfileForm({ ...profileForm, basicPrice: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <textarea
                            rows="2"
                            placeholder="Basic Package description and features..."
                            value={profileForm.basicDescription}
                            onChange={(e) => setProfileForm({ ...profileForm, basicDescription: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs resize-none font-semibold"
                          />
                        </div>
                      </div>

                      {/* Standard Package */}
                      <div className="p-4 rounded-2xl bg-cream/10 border border-rosegold/15 space-y-3">
                        <span className="text-[9px] font-bold text-rosegold dark:text-goldAccent uppercase tracking-widest">Standard Tier (Recommended)</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              placeholder="Package Name"
                              value={profileForm.standardName}
                              onChange={(e) => setProfileForm({ ...profileForm, standardName: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Price (e.g. ₹1,20,000)"
                              value={profileForm.standardPrice}
                              onChange={(e) => setProfileForm({ ...profileForm, standardPrice: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <textarea
                            rows="2"
                            placeholder="Standard Package description and features..."
                            value={profileForm.standardDescription}
                            onChange={(e) => setProfileForm({ ...profileForm, standardDescription: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs resize-none font-semibold"
                          />
                        </div>
                      </div>

                      {/* Premium Package */}
                      <div className="p-4 rounded-2xl bg-cream/10 border border-rosegold/15 space-y-3">
                        <span className="text-[9px] font-bold text-rosegold dark:text-goldAccent uppercase tracking-widest">Premium Tier</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              placeholder="Package Name"
                              value={profileForm.premiumName}
                              onChange={(e) => setProfileForm({ ...profileForm, premiumName: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Price (e.g. ₹2,50,000)"
                              value={profileForm.premiumPrice}
                              onChange={(e) => setProfileForm({ ...profileForm, premiumPrice: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <textarea
                            rows="2"
                            placeholder="Premium Package description and features..."
                            value={profileForm.premiumDescription}
                            onChange={(e) => setProfileForm({ ...profileForm, premiumDescription: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-rosegold/25 bg-white dark:bg-darkbg text-darktext dark:text-white outline-none text-xs resize-none font-semibold"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Portfolio Event Management */}
                  <div className="p-6 md:p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-playfair uppercase tracking-wider">Publish Past Events Portfolio</h3>
                      <p className="text-[10px] text-slate-450 mt-1">Publish completed weddings to build credibility with planners and clients</p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const imagesArray = eventForm.images.split(',').map(s => s.trim()).filter(Boolean);
                      addEventMutation.mutate({
                        name: eventForm.name,
                        eventType: eventForm.eventType,
                        plannerName: eventForm.plannerName,
                        location: eventForm.location,
                        date: eventForm.date,
                        clientRating: Number(eventForm.clientRating) || 5,
                        images: imagesArray
                      });
                    }} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-[10px] uppercase text-slate-400">Event Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mira's Royal Sangeet"
                            value={eventForm.name}
                            onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] uppercase text-slate-400">Event Type</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Wedding, Sangeet, Engagement"
                            value={eventForm.eventType}
                            onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-[10px] uppercase text-slate-400">Location</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Taj Lands End, Mumbai"
                            value={eventForm.location}
                            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] uppercase text-slate-400">Date</label>
                          <input
                            type="date"
                            required
                            value={eventForm.date}
                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-[10px] uppercase text-slate-400">Planner (optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Grand Weddings"
                            value={eventForm.plannerName}
                            onChange={(e) => setEventForm({ ...eventForm, plannerName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] uppercase text-slate-400">Client Rating (1-5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            required
                            value={eventForm.clientRating}
                            onChange={(e) => setEventForm({ ...eventForm, clientRating: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Event Photos (comma separated URLs)</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/photo-1, https://images.unsplash.com/photo-2"
                          value={eventForm.images}
                          onChange={(e) => setEventForm({ ...eventForm, images: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={addEventMutation.isPending}
                        className="w-full py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-extrabold uppercase tracking-widest text-[10px] rounded-xl hover:opacity-90 transition-all shadow"
                      >
                        {addEventMutation.isPending ? "Adding Event..." : "Publish Event"}
                      </button>
                    </form>

                    {/* Display existing events list */}
                    <div className="border-t border-rosegold/10 pt-6">
                      <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-4">Published Events ({vendorProfile?.previousEvents?.length || 0})</h4>
                      <div className="space-y-3 text-xs">
                        {vendorProfile?.previousEvents?.map((evt, idx) => (
                          <div key={idx} className="p-3 bg-cream/10 border border-rosegold/15 rounded-2xl flex justify-between items-start gap-4">
                            <div className="flex items-center space-x-3">
                              {evt.images?.[0] ? (
                                <img src={evt.images[0]} alt="event thumbnail" className="w-12 h-12 rounded-xl object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-rosegold/10 text-rosegold flex items-center justify-center font-bold font-playfair">P</div>
                              )}
                              <div>
                                <h5 className="font-extrabold text-darktext dark:text-white font-playfair">{evt.name}</h5>
                                <p className="text-[10px] text-slate-450">{evt.eventType} • {evt.location}</p>
                                <p className="text-[9px] text-slate-450 italic mt-0.5">Rating: {evt.clientRating} ★ {evt.plannerName ? `| Planned by: ${evt.plannerName}` : ''}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold bg-rosegold/10 text-rosegold px-2 py-0.5 rounded animate-pulse">
                              {evt.date ? new Date(evt.date).toLocaleDateString() : ''}
                            </span>
                          </div>
                        ))}
                        {(!vendorProfile?.previousEvents || vendorProfile.previousEvents.length === 0) && (
                          <p className="text-xs text-darktext/50 text-center py-4 font-light">No published events found.</p>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
};

export default VendorDashboard;
