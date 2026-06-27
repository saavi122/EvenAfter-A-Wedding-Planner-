import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheck, FiX, FiCalendar, FiMessageSquare, FiBriefcase, FiUsers, 
  FiStar, FiActivity, FiMapPin, FiClock, FiPlus, FiTrash2, FiHeart,
  FiPrinter, FiDownload, FiDollarSign, FiShield
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const formatINR = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

export const PlannerDashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [plannerTab, setPlannerTab] = useState('Overview');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('All');

  // Fetch Planner profile me
  const { data: profileMeResponse, refetch: refetchProfileMe } = useQuery({
    queryKey: ['plannerProfileMe'],
    queryFn: async () => {
      const res = await fetch('/api/planners/profile/me');
      if (!res.ok) throw new Error('Failed to fetch planner profile');
      return res.json();
    },
    enabled: plannerTab === 'My Profile'
  });

  const plannerProfile = profileMeResponse?.data;

  // Fetch Planner analytics
  const { data: analyticsResponse } = useQuery({
    queryKey: ['plannerAnalytics'],
    queryFn: async () => {
      const res = await fetch('/api/planners/analytics/stats');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: plannerTab === 'My Profile'
  });

  const analytics = analyticsResponse?.data || { profileViews: 0, totalHires: 0, revenueGenerated: 0, averageRating: 5.0 };

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phoneNo: '',
    companyName: '',
    bio: '',
    citiesServed: '',
    specializations: [],
    servicesOffered: '',
    coverImage: '',
    profileImage: '',
    experience: ''
  });

  useEffect(() => {
    if (plannerProfile) {
      setProfileForm({
        name: plannerProfile.userId?.name || '',
        email: plannerProfile.userId?.email || '',
        phoneNo: plannerProfile.userId?.phoneNo || '',
        companyName: plannerProfile.companyName || '',
        bio: plannerProfile.bio || '',
        citiesServed: plannerProfile.citiesServed?.join(', ') || '',
        specializations: plannerProfile.specializations || [],
        servicesOffered: plannerProfile.servicesOffered?.join(', ') || '',
        coverImage: plannerProfile.coverImage || '',
        profileImage: plannerProfile.profileImage || '',
        experience: plannerProfile.exprience || plannerProfile.experience || ''
      });
    }
  }, [plannerProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await fetch('/api/planners/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update profile');
      return result.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      refetchProfileMe();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    }
  });

  const [eventForm, setEventForm] = useState({
    name: '',
    venue: '',
    date: '',
    guestCount: 100,
    budget: '',
    eventType: 'Wedding',
    clientFeedback: '',
    gallery: '',
    vendorsCollaborated: ''
  });

  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const res = await fetch('/api/planners/events', {
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
        venue: '',
        date: '',
        guestCount: 100,
        budget: '',
        eventType: 'Wedding',
        clientFeedback: '',
        gallery: '',
        vendorsCollaborated: ''
      });
      queryClient.invalidateQueries({ queryKey: ['plannerEvents'] });
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

  // Timeline form state
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');
  const [timelineDate, setTimelineDate] = useState('');

  // Budget item form state
  const [budgetItemCategory, setBudgetItemCategory] = useState('');
  const [budgetItemAllocated, setBudgetItemAllocated] = useState('');
  const [budgetItemSpent, setBudgetItemSpent] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Meeting form state
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [meetAgenda, setMeetAgenda] = useState('');
  const [meetType, setMeetType] = useState('Google Meet');

  // File upload state
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Moodboard');

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

  // 2. Fetch active events managed by this planner
  const { data: eventsResponse } = useQuery({
    queryKey: ['plannerEvents'],
    queryFn: async () => {
      const res = await fetch('/api/events/my-events');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    }
  });

  const weddingEvents = eventsResponse?.data || [];
  const activeEvent = weddingEvents.find(e => e._id === selectedEventId) || weddingEvents[0];

  // Set default selected event id once loaded
  useEffect(() => {
    if (weddingEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(weddingEvents[0]._id);
    }
  }, [weddingEvents, selectedEventId]);

  // 3. Fetch Tasks for selected event
  const { data: tasksResponse } = useQuery({
    queryKey: ['eventTasks', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      const res = await fetch(`/api/events/${selectedEventId}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const result = await res.json();
      return result.data || [];
    },
    enabled: !!selectedEventId
  });

  const tasksList = tasksResponse || [];

  // Mutations
  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      const res = await fetch(`/api/planner-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Hiring proposal successfully ${variables.status.toLowerCase()}ed!`);
      queryClient.invalidateQueries({ queryKey: ['plannerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['plannerEvents'] });
    }
  });

  const updateWeddingMutation = useMutation({
    mutationFn: async (updateData) => {
      const res = await fetch(`/api/events/${selectedEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Wedding event successfully updated");
      queryClient.invalidateQueries({ queryKey: ['plannerEvents'] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const res = await fetch(`/api/events/${selectedEventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Checklist task added");
      setTaskTitle('');
      setTaskDueDate('');
      queryClient.invalidateQueries({ queryKey: ['eventTasks', selectedEventId] });
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (docData) => {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Project file registered in archive");
      setDocName('');
      queryClient.invalidateQueries({ queryKey: ['myDocuments'] });
    }
  });

  const scheduleMeetingMutation = useMutation({
    mutationFn: async (meetData) => {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetData)
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Consultation meeting scheduled");
      setMeetDate('');
      setMeetTime('');
      setMeetAgenda('');
    }
  });

  const handleRequestStatus = (requestId, status) => {
    updateRequestMutation.mutate({ requestId, status });
  };

  const handleAddTimeline = (e) => {
    e.preventDefault();
    if (!timelineTitle || !timelineDate || !activeEvent) return;
    const newTimeline = [...(activeEvent.timeline || []), {
      title: timelineTitle,
      description: timelineDesc,
      date: new Date(timelineDate),
      status: 'Pending'
    }];
    updateWeddingMutation.mutate({ timeline: newTimeline });
    setTimelineTitle('');
    setTimelineDesc('');
    setTimelineDate('');
  };

  const handleAddBudgetItem = (e) => {
    e.preventDefault();
    if (!budgetItemCategory || !budgetItemAllocated || !activeEvent) return;
    const newBudgetItems = [...(activeEvent.budgetItems || []), {
      category: budgetItemCategory,
      allocated: parseFloat(budgetItemAllocated),
      spent: parseFloat(budgetItemSpent || 0),
      status: 'Allocated'
    }];
    updateWeddingMutation.mutate({ budgetItems: newBudgetItems });
    setBudgetItemCategory('');
    setBudgetItemAllocated('');
    setBudgetItemSpent('');
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle) return;
    createTaskMutation.mutate({
      title: taskTitle,
      dueDate: taskDueDate ? new Date(taskDueDate) : null
    });
  };

  const handleProgressChange = (e) => {
    updateWeddingMutation.mutate({ progress: parseInt(e.target.value) });
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!docName) return;
    uploadFileMutation.mutate({
      name: docName,
      type: docType,
      size: 450000,
      eventId: selectedEventId
    });
  };

  const handleMeetingSubmit = (e) => {
    e.preventDefault();
    if (!meetDate || !meetTime || !meetAgenda || !activeEvent) return;
    scheduleMeetingMutation.mutate({
      plannerId: user._id,
      clientId: activeEvent.clientId?._id || activeEvent.clientId,
      date: meetDate,
      time: meetTime,
      agenda: meetAgenda,
      meetingType: meetType
    });
  };

  if (requestsLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center bg-ivory dark:bg-darkbg">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-rosegold/20 border-t-rosegold dark:border-goldAccent/20 dark:border-t-goldAccent animate-spin" />
          <p className="font-playfair text-xs tracking-widest text-rosegold dark:text-goldAccent uppercase animate-pulse">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 font-roboto">
      
      {/* Wedding Command Center Cover Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/35 dark:bg-darkcard p-6 md:p-8 shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 dark:opacity-5 pointer-events-none select-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-rosegold dark:text-goldAccent w-full h-full">
            <path d="M50 0 C40 20 20 40 0 50 C20 60 40 80 50 100 C60 80 80 60 100 50 C80 40 60 20 50 0 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-rosegold dark:text-goldAccent uppercase block mb-1">
              Registry Headquarters
            </span>
            <h2 className="text-3xl font-playfair font-semibold text-darktext dark:text-white tracking-wide">
              Wedding Command Center: <span className="text-rosegold dark:text-goldAccent">{user?.name}</span>
            </h2>
            <p className="font-playfair italic text-xs text-darktext/70 dark:text-gray-400 mt-2 max-w-xl font-light">
              "Every grand layout starts with a clean schedule, a curated moodboard, and verified vendor listings."
            </p>
          </div>
          <Link
            to="/planner/vendors"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rosegold dark:bg-goldAccent hover:bg-rosegold/90 dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow-sm transition-all"
          >
            <span>Explore Vendor Registry</span>
            <FiCheck className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-rosegold/20 dark:border-goldAccent/15 pb-2">
        {['Overview', 'Timeline & Progress', 'Budget & Checklist', 'Project Files', 'Vendor Meetings', 'Billing & Invoices', 'My Profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setPlannerTab(tab)}
            className={`px-4 py-2 rounded-t-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-305 border-t border-x border-transparent -mb-2 ${
              plannerTab === tab 
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
          key={plannerTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm"
        >
          {/* OVERVIEW TAB */}
          {plannerTab === 'Overview' && (
            <div className="space-y-8">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Active Contracts', val: activeClients.length, label: 'Assigned Clients', icon: FiUsers },
                  { name: 'Hiring Proposals', val: pendingRequests.length, label: 'Incoming Client Briefs', icon: FiBriefcase },
                  { name: 'Events Catalog', val: weddingEvents.length, label: 'Current Weddings', icon: FiActivity },
                  { name: 'Rating status', val: '5.0', label: 'Client Feedback', icon: FiStar }
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
                {/* Proposals & Active Clients list */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Incoming proposals */}
                  <div className="p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair flex items-center">
                      <span className="w-2 h-2 rounded-full bg-rosegold dark:bg-goldAccent mr-2" />
                      Incoming Client Proposals ({pendingRequests.length})
                    </h3>
                    {pendingRequests.length === 0 && (
                      <p className="text-xs text-darktext/50 py-4 text-center">No pending request briefs found.</p>
                    )}
                    {pendingRequests.map((reqItem) => (
                      <div key={reqItem._id} className="p-4 rounded-xl bg-white/70 dark:bg-black/25 border border-rosegold/15 dark:border-goldAccent/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-darktext dark:text-white font-playfair">{reqItem.clientId?.name?.name || 'Couple'} - {reqItem.weddingType}</span>
                          <p className="text-darktext/60 dark:text-gray-405">{reqItem.location} • Budget: {reqItem.budget?.toLocaleString()} INR • Date: {new Date(reqItem.weddingDate).toLocaleDateString()}</p>
                          <p className="italic text-darktext/50 font-light">"{reqItem.requirements}"</p>
                        </div>
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                          <button
                            onClick={() => handleRequestStatus(reqItem._id, "Accepted")}
                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center space-x-1"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRequestStatus(reqItem._id, "Rejected")}
                            className="flex-1 md:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center justify-center space-x-1"
                          >
                            <FiX className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* My active clients */}
                  <div className="p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                      Assigned Clients ({activeClients.length})
                    </h3>
                    {activeClients.length === 0 && (
                      <p className="text-xs text-darktext/50 py-4 text-center">No active couples on roster.</p>
                    )}
                    {activeClients.map((clientRequest) => (
                      <div key={clientRequest._id} className="p-3.5 rounded-xl bg-white/70 dark:bg-black/25 border border-rosegold/10 dark:border-goldAccent/10 flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-bold text-darktext dark:text-white font-playfair">
                            {clientRequest.clientId?.name?.name || "Client"}
                          </h4>
                          <p className="text-darktext/60 dark:text-gray-400 mt-0.5">{clientRequest.weddingType} • {clientRequest.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/planner/chat/${clientRequest.clientId?.name?._id || clientRequest.clientId?.userId?._id}`)}
                            className="p-2 rounded bg-cream/35 hover:bg-rosegold/10 text-rosegold border border-rosegold/20"
                          >
                            <FiMessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const match = weddingEvents.find(e => e.clientId?._id === clientRequest.clientId?._id || e.clientId === clientRequest.clientId?._id);
                              if (match) {
                                setSelectedEventId(match._id);
                                setPlannerTab('Timeline & Progress');
                              } else {
                                toast.error("Wedding details registry missing");
                              }
                            }}
                            className="px-3 py-1.5 bg-rosegold text-white dark:bg-goldAccent dark:text-black text-[9px] font-bold uppercase tracking-wider rounded"
                          >
                            Manage Wedding
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Right Side: Moodboards / galleries preview */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent">Wedding Galleries</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-20 rounded-xl overflow-hidden bg-cream relative group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=200" alt="gallery-1" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-20 rounded-xl overflow-hidden bg-cream relative group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=200" alt="gallery-2" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TIMELINE & PROGRESS TAB */}
          {plannerTab === 'Timeline & Progress' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-semibold">
              
              {/* Wedding event sidebar selector */}
              <div className="lg:col-span-4 p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent">Current Weddings</h4>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                >
                  {weddingEvents.map(evt => (
                    <option key={evt._id} value={evt._id}>{evt.title}</option>
                  ))}
                </select>

                {activeEvent && (
                  <div className="space-y-4 pt-4 border-t border-rosegold/10">
                    <div className="space-y-1">
                      <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-wider block font-bold">Venue</label>
                      <input
                        type="text"
                        defaultValue={activeEvent.venue}
                        onBlur={(e) => updateWeddingMutation.mutate({ venue: e.target.value })}
                        className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent font-playfair"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-wider block font-bold">Wedding Date</label>
                      <input
                        type="date"
                        defaultValue={activeEvent.date ? new Date(activeEvent.date).toISOString().split('T')[0] : ''}
                        onBlur={(e) => updateWeddingMutation.mutate({ date: e.target.value })}
                        className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-darktext/60 dark:text-gray-400 tracking-wider">
                        <span>Planning Progress</span>
                        <span className="text-rosegold dark:text-goldAccent">{activeEvent.progress || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={activeEvent.progress || 0}
                        onChange={handleProgressChange}
                        className="w-full accent-rosegold dark:accent-goldAccent cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline builder */}
              <div className="lg:col-span-8 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10">Manage Wedding Timeline</h4>
                
                <form onSubmit={handleAddTimeline} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={timelineTitle}
                    onChange={(e) => setTimelineTitle(e.target.value)}
                    required
                    placeholder="Milestone title..."
                    className="bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded px-3 py-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent font-playfair"
                  />
                  <input
                    type="text"
                    value={timelineDesc}
                    onChange={(e) => setTimelineDesc(e.target.value)}
                    placeholder="Description..."
                    className="bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded px-3 py-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={timelineDate}
                      onChange={(e) => setTimelineDate(e.target.value)}
                      required
                      className="bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded px-3 py-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent flex-1"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-rosegold dark:bg-goldAccent text-white dark:text-black rounded font-bold flex items-center justify-center"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Event timeline milestones */}
                <div className="relative border-l border-rosegold/20 dark:border-goldAccent/15 ml-4 pl-6 space-y-6 pt-2">
                  {activeEvent?.timeline?.map((item, idx) => (
                    <div key={item._id || idx} className="relative">
                      <div className={`absolute left-[-31px] top-1 w-3.5 h-3.5 rounded-full border bg-white dark:bg-darkbg ${
                        item.status === 'Completed' ? 'border-rosegold bg-rosegold dark:border-goldAccent dark:bg-goldAccent' : 'border-rosegold/30 dark:border-goldAccent/30'
                      }`} />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-bold text-darktext dark:text-white font-playfair">{item.title}</h5>
                            <span className="text-[9px] text-darktext/50 font-mono">({new Date(item.date).toLocaleDateString()})</span>
                          </div>
                          <p className="text-[11px] text-darktext/70 dark:text-gray-400 mt-1 font-light">{item.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const updatedTimeline = activeEvent.timeline.map((t, i) => i === idx ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t);
                              updateWeddingMutation.mutate({ timeline: updatedTimeline });
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              item.status === 'Completed' ? 'bg-cream/50 text-darktext/50 dark:bg-black/30' : 'bg-rosegold dark:bg-goldAccent text-white dark:text-black'
                            }`}
                          >
                            {item.status === 'Completed' ? 'Undo' : 'Complete'}
                          </button>
                          <button
                            onClick={() => {
                              const updatedTimeline = activeEvent.timeline.filter((_, i) => i !== idx);
                              updateWeddingMutation.mutate({ timeline: updatedTimeline });
                            }}
                            className="text-rose-500 p-1 hover:bg-rose-500/10 rounded"
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

          {/* BUDGETS & TASKS TAB */}
          {plannerTab === 'Budget & Checklist' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-semibold">
              
              {/* Budget tracker */}
              <div className="lg:col-span-5 p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent">Budget Tracking</h4>
                
                {activeEvent && (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/70 dark:bg-black/25 border border-rosegold/10 rounded-xl">
                      <span className="text-[9px] uppercase tracking-widest text-darktext/50">Total Budget Allocation</span>
                      <h4 className="text-base font-bold font-playfair text-darktext dark:text-white mt-0.5">{(activeEvent.budget || 0).toLocaleString()} INR</h4>
                    </div>

                    <form onSubmit={handleAddBudgetItem} className="space-y-2 pt-2 border-t border-rosegold/10">
                      <input
                        type="text"
                        value={budgetItemCategory}
                        onChange={(e) => setBudgetItemCategory(e.target.value)}
                        required
                        placeholder="Category (e.g. Venue Decor)..."
                        className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={budgetItemAllocated}
                          onChange={(e) => setBudgetItemAllocated(e.target.value)}
                          required
                          placeholder="Allocated..."
                          className="bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white"
                        />
                        <input
                          type="number"
                          value={budgetItemSpent}
                          onChange={(e) => setBudgetItemSpent(e.target.value)}
                          placeholder="Spent..."
                          className="bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded"
                      >
                        Add Allocation
                      </button>
                    </form>

                    <div className="space-y-2 pt-2 border-t border-rosegold/10">
                      {activeEvent.budgetItems?.map((item, idx) => (
                        <div key={item._id || idx} className="p-2.5 bg-white/50 dark:bg-black/10 border border-rosegold/10 rounded-xl flex justify-between items-center text-[10.5px]">
                          <div>
                            <h5 className="font-bold text-darktext dark:text-white font-playfair">{item.category}</h5>
                            <span className="text-[9px] text-darktext/50">Allocated: {item.allocated} • Spent: {item.spent}</span>
                          </div>
                          <button
                            onClick={() => {
                              const updatedBudget = activeEvent.budgetItems.filter((_, i) => i !== idx);
                              updateWeddingMutation.mutate({ budgetItems: updatedBudget });
                            }}
                            className="text-rose-500 p-1 hover:bg-rose-500/10 rounded"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Checklist tasks */}
              <div className="lg:col-span-7 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10">Checklist Tasks Manager</h4>
                
                <form onSubmit={handleAddTaskSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                    placeholder="Create checklist item..."
                    className="flex-1 bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded px-3 py-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                  />
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded px-3 py-2 text-xs text-darktext dark:text-white outline-none w-[130px]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {tasksList.map((task) => (
                    <div key={task._id} className="p-3 bg-cream/20 dark:bg-darkbg/35 border border-rosegold/10 dark:border-goldAccent/10 rounded-xl flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'Completed'}
                          onChange={async () => {
                            const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
                            await fetch(`/api/tasks/${task._id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            });
                            queryClient.invalidateQueries({ queryKey: ['eventTasks', selectedEventId] });
                          }}
                          className="rounded text-rosegold dark:text-goldAccent w-3.5 h-3.5 cursor-pointer bg-transparent border-rosegold/30 dark:border-goldAccent/30"
                        />
                        <span className={`font-medium ${task.status === 'Completed' ? 'line-through text-darktext/40 dark:text-gray-500' : 'text-darktext dark:text-gray-205'}`}>
                          {task.title}
                        </span>
                      </div>
                      {task.dueDate && (
                        <span className="text-[9px] text-darktext/50 font-mono">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  ))}
                  {tasksList.length === 0 && (
                    <p className="text-xs text-darktext/50 text-center py-4">No checklist tasks logged.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* PROJECT FILES & MOODBOARDS TAB */}
          {plannerTab === 'Project Files' && (
            <div className="max-w-md mx-auto space-y-6 text-xs font-semibold">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10">Upload Moodboards & Files</h4>
              
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Document Name</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    required
                    placeholder="e.g. Traditional Mandap Moodboard"
                    className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2.5 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2.5 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                  >
                    <option value="Moodboard">Inspirations / Mood Board</option>
                    <option value="Contract">Agreement Contract</option>
                    <option value="Catering">Catering / Dining Menu</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow"
                >
                  Register file in workspace
                </button>
              </form>
            </div>
          )}

          {/* VENDOR MEETINGS & CONSULTATIONS TAB */}
          {plannerTab === 'Vendor Meetings' && (
            <div className="max-w-md mx-auto space-y-6 text-xs font-semibold">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10">Meeting Calendar</h4>
              
              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Consultation Date</label>
                    <input
                      type="date"
                      value={meetDate}
                      onChange={(e) => setMeetDate(e.target.value)}
                      required
                      className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Consultation Time</label>
                    <input
                      type="time"
                      value={meetTime}
                      onChange={(e) => setMeetTime(e.target.value)}
                      required
                      className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Platform</label>
                  <select
                    value={meetType}
                    onChange={(e) => setMeetType(e.target.value)}
                    className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2.5 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Agenda</label>
                  <textarea
                    rows="3"
                    value={meetAgenda}
                    onChange={(e) => setMeetAgenda(e.target.value)}
                    required
                    placeholder="e.g. Coordinate flower delivery timeline..."
                    className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2.5 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent resize-none"
                  />
                </div>

              </form>
            </div>
          )}

          {/* BILLING & INVOICES TAB */}
          {plannerTab === 'Billing & Invoices' && (
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
                          {user?.plan === 'Premium Planner' && (
                            <span className="ml-2 inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/25 text-yellow-600 dark:text-goldAccent text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                              <FiShield className="w-2.5 h-2.5" /> Premium
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

                    {/* Auto-renew toggle switch for Premium Users */}
                    {user?.plan === 'Premium Planner' && (
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
                      ) : user?.plan === 'Pro Planner' ? (
                        <div className="flex flex-wrap gap-3">
                          <Link
                            to="/pricing"
                            className="px-4 py-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold tracking-wider rounded-lg text-[10px] uppercase shadow-sm"
                          >
                            Upgrade to Premium
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
                          Premium Tier Active
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
                          Profile showcase, portfolio uploads, basic analytics, and up to 3 client inquiries per month.
                        </p>
                      </div>
                      <div className="p-3 bg-white/40 dark:bg-black/15 rounded-xl border border-rosegold/10">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Pro Planner</span>
                          <span>₹999/month</span>
                        </div>
                        <p className="text-[10px] opacity-75 leading-relaxed">
                          Everything in Free, unlimited client inquiries, featured search placement, and advanced lead analytics.
                        </p>
                      </div>
                      <div className="p-3 bg-white/40 dark:bg-black/15 rounded-xl border border-rosegold/10">
                        <div className="flex justify-between font-bold mb-1">
                          <span>Premium Planner</span>
                          <span>₹2,499/month</span>
                        </div>
                        <p className="text-[10px] opacity-75 leading-relaxed">
                          Priority placements, AI lead matching, custom portfolio site, team collaboration tools, and dedicated support.
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
                        <span>Client Inquiries</span>
                        <span>{user?.plan === 'Free' ? '0 / 3 per month' : 'Unlimited'}</span>
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
                        <span>Portfolio Images</span>
                        <span>{user?.plan === 'Free' ? 'Max 10 images' : 'Unlimited uploads'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-cream/40 dark:bg-darkbg/40 overflow-hidden">
                        <div 
                          className="h-full bg-rosegold dark:bg-goldAccent transition-all duration-300"
                          style={{ width: user?.plan === 'Free' ? '50%' : '100%' }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-medium mb-1.5">
                        <span>Analytics Dashboard</span>
                        <span>{user?.plan === 'Free' ? 'Basic Statistics' : 'Advanced Analytics'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-cream/40 dark:bg-darkbg/40 overflow-hidden">
                        <div 
                          className="h-full bg-rosegold dark:bg-goldAccent transition-all duration-300"
                          style={{ width: user?.plan === 'Free' ? '30%' : '100%' }}
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

          {plannerTab === 'My Profile' && (
            <div className="space-y-8">
              
              {/* Analytics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Views</span>
                  <div className="text-2xl font-black text-darktext dark:text-goldAccent mt-1 font-playfair">{analytics.profileViews}</div>
                  <span className="text-[9px] text-emerald-500 font-semibold mt-1 block">✦ Realtime metric</span>
                </div>
                <div className="p-5 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hires</span>
                  <div className="text-2xl font-black text-darktext dark:text-goldAccent mt-1 font-playfair">{analytics.totalHires}</div>
                  <span className="text-[9px] text-slate-550 block mt-1">From active requests</span>
                </div>
                <div className="p-5 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Generated</span>
                  <div className="text-2xl font-black text-darktext dark:text-goldAccent mt-1 font-playfair">₹{formatINR(analytics.revenueGenerated)}</div>
                  <span className="text-[9px] text-slate-550 block mt-1">Estimated earnings</span>
                </div>
                <div className="p-5 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Rating</span>
                  <div className="text-2xl font-black text-darktext dark:text-goldAccent mt-1 font-playfair flex items-center">
                    <FiStar className="fill-current text-amber-500 mr-1.5 w-5 h-5" />
                    {analytics.averageRating}
                  </div>
                  <span className="text-[9px] text-emerald-500 font-semibold mt-1 block">✦ Verified Reviews</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Edit Profile Form */}
                <div className="p-6 md:p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-playfair uppercase tracking-wider">Edit Public Profile</h3>
                    <p className="text-[10px] text-slate-450 mt-1">Update your professional details and branding assets</p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const citiesServedArray = profileForm.citiesServed.split(',').map(s => s.trim()).filter(Boolean);
                    const servicesOfferedArray = profileForm.servicesOffered.split(',').map(s => s.trim()).filter(Boolean);
                    updateProfileMutation.mutate({
                      ...profileForm,
                      citiesServed: citiesServedArray,
                      servicesOffered: servicesOfferedArray
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Company Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.companyName}
                          onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-slate-400">Professional Bio</label>
                      <textarea
                        rows="3"
                        required
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Experience (e.g. 5 Years)</label>
                        <input
                          type="text"
                          value={profileForm.experience}
                          onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Cities Served (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Mumbai, Goa, Udaipur"
                          value={profileForm.citiesServed}
                          onChange={(e) => setProfileForm({ ...profileForm, citiesServed: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-slate-400">Services Offered (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Venue Selection, Catering Coordination, Decoration"
                        value={profileForm.servicesOffered}
                        onChange={(e) => setProfileForm({ ...profileForm, servicesOffered: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Profile Photo URL</label>
                        <input
                          type="text"
                          value={profileForm.profileImage}
                          onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Cover Image URL</label>
                        <input
                          type="text"
                          value={profileForm.coverImage}
                          onChange={(e) => setProfileForm({ ...profileForm, coverImage: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
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

                {/* Portfolio Event Management */}
                <div className="p-6 md:p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-playfair uppercase tracking-wider">Portfolio Management</h3>
                    <p className="text-[10px] text-slate-450 mt-1">Publish completed weddings to build your credibility</p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const galleryArray = eventForm.gallery.split(',').map(s => s.trim()).filter(Boolean);
                    const vendorsArray = eventForm.vendorsCollaborated.split(',').map(s => s.trim()).filter(Boolean);
                    addEventMutation.mutate({
                      ...eventForm,
                      gallery: galleryArray,
                      vendorsCollaborated: vendorsArray
                    });
                  }} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Event Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Siddharth & Kiara's Vows"
                          value={eventForm.name}
                          onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Event Type</label>
                        <select
                          value={eventForm.eventType}
                          onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        >
                          <option value="Wedding">Royal Wedding</option>
                          <option value="Destination Wedding">Destination Wedding</option>
                          <option value="Beach Wedding">Beach Wedding</option>
                          <option value="Corporate Event">Corporate Event</option>
                          <option value="Engagement Ceremony">Engagement Ceremony</option>
                          <option value="Traditional Wedding">Traditional Wedding</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Venue Location</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Leela Palace, Udaipur"
                          value={eventForm.venue}
                          onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Event Date</label>
                        <input
                          type="date"
                          required
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Budget (INR)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 5000000"
                          value={eventForm.budget}
                          onChange={(e) => setEventForm({ ...eventForm, budget: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase text-slate-400">Guest Count</label>
                        <input
                          type="number"
                          value={eventForm.guestCount}
                          onChange={(e) => setEventForm({ ...eventForm, guestCount: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-slate-400">Client Feedback Review</label>
                      <textarea
                        rows="2"
                        placeholder="Feedback comments from the couple..."
                        value={eventForm.clientFeedback}
                        onChange={(e) => setEventForm({ ...eventForm, clientFeedback: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-slate-400">Collaborated Vendors (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Taj Caterers, Magic Flowers, DJ Ritesh"
                        value={eventForm.vendorsCollaborated}
                        onChange={(e) => setEventForm({ ...eventForm, vendorsCollaborated: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-slate-400">Event Photos Gallery (comma separated URLs)</label>
                      <input
                        type="text"
                        placeholder="https://image1.com, https://image2.com"
                        value={eventForm.gallery}
                        onChange={(e) => setEventForm({ ...eventForm, gallery: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/25 dark:border-slate-800 bg-cream/5 text-darktext dark:text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addEventMutation.isPending}
                      className="w-full py-3 bg-[#4A403A] text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl hover:bg-opacity-95 transition-all shadow"
                    >
                      {addEventMutation.isPending ? "Adding event..." : "Publish Event to Portfolio"}
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default PlannerDashboard;
