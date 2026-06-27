import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiUser, FiUsers, FiBriefcase, FiDollarSign, FiClock, FiMapPin, FiCalendar, 
  FiTrash2, FiPlus, FiMessageSquare, FiSettings, FiCheckCircle, FiAlertCircle, FiX, FiCheck,
  FiMail, FiPhone
} from 'react-icons/fi';
import api from '../../services/api';

const formatINR = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

export const AdminEventDetails = () => {
  const { eventId } = useParams();
  
  const [event, setEvent] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [planners, setPlanners] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modals state
  const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);

  // Edit event form state
  const [editForm, setEditForm] = useState({
    title: '',
    eventType: 'Wedding',
    date: '',
    venue: '',
    location: '',
    budget: '',
    guestCount: '',
    status: 'Planning'
  });

  const chatEndRef = useRef(null);

  const fetchEventDetails = async () => {
    try {
      const [eventRes, progressRes, plannersRes, vendorsRes] = await Promise.all([
        api.get(`/admin/events/${eventId}`),
        api.get(`/admin/events/${eventId}/progress`),
        api.get('/admin/planners'),
        api.get('/admin/vendors')
      ]);

      const fetchedEvent = eventRes.data.data;
      if (fetchedEvent) {
        if (fetchedEvent.vendors) {
          fetchedEvent.vendors = fetchedEvent.vendors.filter(v => v !== null);
        }
        setEvent(fetchedEvent);
        
        // Seed edit form values
        setEditForm({
          title: fetchedEvent.title || '',
          eventType: fetchedEvent.eventType || 'Wedding',
          date: fetchedEvent.date ? fetchedEvent.date.substring(0, 10) : '',
          venue: fetchedEvent.venue || '',
          location: fetchedEvent.location || '',
          budget: fetchedEvent.budget || '',
          guestCount: fetchedEvent.guestCount || '',
          status: fetchedEvent.status || 'Planning'
        });
      } else {
        setEvent(null);
      }
      setProgressData(progressRes.data.data);
      setPlanners(plannersRes.data.data || []);
      setVendorsList(vendorsRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const loadChatHistory = async () => {
    setChatLoading(true);
    try {
      const res = await api.get(`/admin/events/${eventId}/chat`);
      setChatHistory(res.data.data || []);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      loadChatHistory();
    }
  }, [isChatOpen]);

  const handleAssignPlanner = async (plannerId) => {
    try {
      await api.put(`/admin/events/${eventId}/assign-planner`, { plannerId });
      setIsPlannerModalOpen(false);
      fetchEventDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to assign planner.');
    }
  };

  const handleAssignVendor = async (vendorId) => {
    try {
      // Add vendor to current list of vendors
      const currentVendorIds = event.vendors ? event.vendors.map(v => v._id) : [];
      if (currentVendorIds.includes(vendorId)) {
        alert("Vendor already assigned.");
        return;
      }
      const updatedVendorIds = [...currentVendorIds, vendorId];
      await api.put(`/admin/events/${eventId}/assign-vendors`, { vendors: updatedVendorIds });
      setIsVendorModalOpen(false);
      fetchEventDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to assign vendor.');
    }
  };

  const handleRemoveVendor = async (vendorId) => {
    if (!window.confirm("Are you sure you want to remove this vendor from the event?")) return;
    try {
      const updatedVendorIds = event.vendors.map(v => v._id).filter(id => id !== vendorId);
      await api.put(`/admin/events/${eventId}/assign-vendors`, { vendors: updatedVendorIds });
      fetchEventDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to remove vendor.');
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/events/${eventId}`, editForm);
      setIsEditEventOpen(false);
      fetchEventDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to update event details.');
    }
  };

  const toggleTimelineStatus = async (itemIndex, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    const updatedTimeline = [...event.timeline];
    updatedTimeline[itemIndex].status = nextStatus;
    
    try {
      await api.put(`/admin/events/${eventId}`, { timeline: updatedTimeline });
      fetchEventDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to update milestone status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-rosegold/30 border-t-rosegold dark:border-goldAccent/30 dark:border-t-goldAccent rounded-full animate-spin"></div>
          <p className="font-playfair text-xs tracking-widest text-darktext/60 dark:text-gray-400 uppercase animate-pulse">Loading Event Suite...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center p-12 bg-white dark:bg-darkcard border border-red-500/20 rounded-2xl">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="font-playfair font-bold text-lg text-darktext dark:text-white">Event Not Found</h3>
        <p className="text-xs text-darktext/50 dark:text-gray-400 mt-2 mb-4">The event details could not be retrieved. It may have been deleted.</p>
        <Link to="/admin/events" className="px-4 py-2 bg-rosegold text-white text-xs rounded-xl font-bold">Back to Events</Link>
      </div>
    );
  }

  // Calculate dynamic segment sizes for the SVG Doughnut Chart
  const budgetItems = event.budgetItems || [];
  const totalAllocated = budgetItems.reduce((acc, curr) => acc + (curr.allocated || 0), 0);
  
  const budgetColors = [
    '#C9A27E', // Rose Gold
    '#A8B8A3', // Sage
    '#D8C3A5', // Champagne
    '#B19FFB', // Lavender
    '#F4A261', // Soft Orange
    '#2A9D8F', // Soft Teal
    '#E76F51', // Soft Coral
    '#9D4EDD'  // Soft Purple
  ];

  let accumulatedPercent = 0;
  const segments = budgetItems.map((item, idx) => {
    const allocated = item.allocated || 0;
    const percent = totalAllocated > 0 ? (allocated / totalAllocated) * 100 : 0;
    const color = budgetColors[idx % budgetColors.length];
    const segment = {
      category: item.category,
      allocated,
      spent: item.spent || 0,
      percent,
      color,
      dashArray: `${percent} ${100 - percent}`,
      dashOffset: -accumulatedPercent
    };
    accumulatedPercent += percent;
    return segment;
  }).filter(s => s.percent > 0);

  return (
    <div className="space-y-8 pb-16 text-darktext dark:text-gray-300">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/admin/events" className="p-2 rounded-xl bg-white dark:bg-darkcard border border-rosegold/20 dark:border-goldAccent/15 text-rosegold dark:text-goldAccent hover:opacity-90">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-playfair text-xl md:text-2xl font-bold text-darktext dark:text-white flex items-center gap-2.5">
              {event.title}
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                event.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
              }`}>{event.status}</span>
            </h2>
            <div className="font-mono text-[9px] text-darktext/50 dark:text-gray-500 mt-0.5 uppercase">ID: {event._id}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {event.clientId && event.plannerId && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-white dark:bg-darkcard text-rosegold dark:text-goldAccent text-xs font-bold hover:bg-cream/10 cursor-pointer"
            >
              <FiMessageSquare className="w-4 h-4 animate-bounce" />
              Chat Log
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Client Card */}
        <div className="bg-white dark:bg-darkcard p-5 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-4">
          <div className="border-b border-rosegold/10 dark:border-goldAccent/10 pb-3 flex justify-between items-center">
            <h3 className="font-playfair font-bold text-xs uppercase tracking-wider text-rosegold dark:text-goldAccent">Client Information</h3>
            <FiUser className="w-4 h-4 text-rosegold/50 dark:text-goldAccent/50" />
          </div>
          
          <div className="flex items-center space-x-3.5">
            <img 
              src={event.clientId?.profilePhoto || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256"} 
              alt="Client" 
              className="w-12 h-12 rounded-full object-cover border border-rosegold/20"
            />
            <div className="overflow-hidden">
              <h4 className="font-playfair font-bold text-sm text-darktext dark:text-white truncate">{event.clientId?.name?.name || 'Sarah Miller'}</h4>
              <p className="text-[10px] text-darktext/50 dark:text-gray-400 truncate">{event.clientId?.email?.email || 'client@example.com'}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between"><span className="text-darktext/50 dark:text-gray-400">Phone:</span><span className="font-medium">{event.clientId?.name?.phoneNo || '9876543210'}</span></div>
            <div className="flex justify-between"><span className="text-darktext/50 dark:text-gray-400">Address:</span><span className="font-medium text-right max-w-[150px] truncate">{event.clientId?.address || 'Mumbai, India'}</span></div>
            <div className="flex justify-between"><span className="text-darktext/50 dark:text-gray-400">Wedding Date:</span><span className="font-medium">{event.clientId?.weddingDate ? new Date(event.clientId.weddingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span></div>
            <div className="flex justify-between"><span className="text-darktext/50 dark:text-gray-400">Partner:</span><span className="font-medium">{event.clientId?.partnerName || 'David Jenkins'}</span></div>
          </div>
        </div>

        {/* 2. Planner Card */}
        <div className="bg-white dark:bg-darkcard p-5 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-4">
          <div className="border-b border-rosegold/10 dark:border-goldAccent/10 pb-3 flex justify-between items-center">
            <h3 className="font-playfair font-bold text-xs uppercase tracking-wider text-rosegold dark:text-goldAccent">Planner Assigned</h3>
            <FiBriefcase className="w-4 h-4 text-rosegold/50 dark:text-goldAccent/50" />
          </div>

          {event.plannerId ? (
            <>
              <div className="flex items-center space-x-3.5">
                <img 
                  src={event.plannerId?.profileImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256"} 
                  alt="Planner" 
                  className="w-12 h-12 rounded-full object-cover border border-rosegold/20"
                />
                <div className="overflow-hidden">
                  <h4 className="font-playfair font-bold text-sm text-darktext dark:text-white truncate">{event.plannerId?.name?.name || 'Sophia Ross'}</h4>
                  <p className="text-[10px] text-darktext/50 dark:text-gray-400 truncate">{event.plannerId?.companyName || 'Luxury Wedding Planner'}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between"><span className="text-darktext/50 dark:text-gray-400">Email:</span><span className="font-medium truncate max-w-[150px]">{event.plannerId?.name?.email || 'planner@example.com'}</span></div>
                <div className="flex justify-between"><span className="text-darktext/50 dark:text-gray-400">Phone:</span><span className="font-medium">{event.plannerId?.name?.phoneNo || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-darktext/50 dark:text-gray-400">Experience:</span><span className="font-medium">{event.plannerId?.exprience || '8 Years'}</span></div>
                <div className="flex justify-between"><span className="text-darktext/50 dark:text-gray-400">Availability:</span><span className="font-semibold text-green-500">{event.plannerId?.availabilityStatus || 'Available'}</span></div>
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-3">
              <p className="text-xs text-red-500/80 font-medium italic">No planner assigned to supervisor yet.</p>
            </div>
          )}
        </div>

        {/* 3. Event Meta Details */}
        <div className="bg-white dark:bg-darkcard p-5 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-4 md:col-span-1">
          <div className="border-b border-rosegold/10 dark:border-goldAccent/10 pb-3 flex justify-between items-center">
            <h3 className="font-playfair font-bold text-xs uppercase tracking-wider text-rosegold dark:text-goldAccent">Planning Progress</h3>
            <FiClock className="w-4 h-4 text-rosegold/50 dark:text-goldAccent/50" />
          </div>

          <div className="flex items-center gap-4">
            {/* SVG Circular Progress Gauge */}
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-cream dark:stroke-darkbg fill-transparent"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-rosegold dark:stroke-goldAccent fill-transparent transition-all duration-1000 ease-out"
                  strokeWidth="6"
                  strokeDasharray="213.6"
                  strokeDashoffset={213.6 - (213.6 * (event.progress || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-playfair text-sm font-black text-darktext dark:text-white leading-none">{event.progress || 0}%</span>
                <span className="text-[7px] text-darktext/40 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">Status</span>
              </div>
            </div>

            {/* Quick Meta details list */}
            <div className="flex-1 space-y-2 text-[11px] overflow-hidden">
              <div className="truncate"><span className="font-semibold text-darktext/50 dark:text-gray-400">City:</span> {event.location || 'Mumbai'}</div>
              <div className="truncate"><span className="font-semibold text-darktext/50 dark:text-gray-400">Venue:</span> {event.venue || 'TBD'}</div>
              <div><span className="font-semibold text-darktext/50 dark:text-gray-400">Date:</span> {event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</div>
              <div><span className="font-semibold text-darktext/50 dark:text-gray-400">Guests:</span> {event.guestCount || 0} Guests</div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Progress timeline & Budget analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Milestones Timeline */}
        <div className="lg:col-span-5 bg-white dark:bg-darkcard p-6 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-6">
          <div>
            <h3 className="font-playfair font-bold text-base text-darktext dark:text-white">Milestones Tracker</h3>
            <p className="text-[10px] text-darktext/50 dark:text-gray-400 mt-0.5">Planning milestones status progress timeline.</p>
          </div>

          <div className="space-y-5 relative ml-2.5">
            {/* Dashed vertical connector line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 border-l-2 border-dashed border-rosegold/20 dark:border-goldAccent/15"></div>

            {event.timeline && event.timeline.map((item, idx) => {
              const isCompleted = item.status === 'Completed';
              // Find if this is the active milestone (first pending one)
              const isActive = !isCompleted && (idx === 0 || (event.timeline[idx - 1] && event.timeline[idx - 1].status === 'Completed'));

              return (
                <div key={item._id || idx} className="relative pl-8 flex gap-3.5 group">
                  {/* Indicator Icon/Number */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center border text-[9px] font-mono font-bold transition-all duration-300 shadow-sm z-10 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white shadow-green-500/10'
                        : isActive
                        ? 'bg-amber-500 border-amber-500 text-white animate-pulse shadow-amber-500/20'
                        : 'bg-white dark:bg-darkcard border-rosegold/30 dark:border-goldAccent/25 text-rosegold/50 dark:text-goldAccent/45'
                    }`}
                  >
                    {isCompleted ? <FiCheck className="w-3.5 h-3.5 translate-y-[1px]" strokeWidth={3.5} /> : idx + 1}
                  </div>

                  {/* Milestone Card Content */}
                  <div className={`flex-1 p-3 rounded-xl border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500/5 border-green-500/10 dark:border-green-500/5'
                      : isActive
                      ? 'bg-amber-500/5 border-amber-500/20 dark:border-amber-500/10 ring-1 ring-amber-500/10'
                      : 'bg-cream/5 border-rosegold/5 dark:border-goldAccent/5 group-hover:bg-cream/10 dark:group-hover:bg-darkbg/40'
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-playfair text-xs font-black text-darktext dark:text-white flex items-center gap-1.5">
                        {item.title}
                        {isActive && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[7px] font-extrabold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/15 animate-pulse">
                            Active
                          </span>
                        )}
                      </h4>
                      <span className="text-[8px] font-mono text-darktext/40 dark:text-gray-500 font-bold bg-cream/30 dark:bg-darkbg px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                      </span>
                    </div>
                    <p className="text-[10px] text-darktext/50 dark:text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Budget Breakdown & Costs */}
        <div className="lg:col-span-7 bg-white dark:bg-darkcard p-6 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-6">
          <div>
            <h3 className="font-playfair font-bold text-base text-darktext dark:text-white">Budget Allocation Analysis</h3>
            <p className="text-[10px] text-darktext/50 dark:text-gray-400 mt-0.5">Budget spend vs allocation categories breakdown.</p>
          </div>

          {progressData && (
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-rosegold/10 dark:border-goldAccent/10">
              <div className="space-y-1 bg-cream/20 dark:bg-darkbg p-3.5 rounded-xl text-center">
                <span className="text-[9px] text-darktext/40 dark:text-gray-400 uppercase font-bold tracking-wider">Total</span>
                <div className="text-sm font-black font-playfair">₹{formatINR(progressData.totalBudget)}</div>
              </div>
              <div className="space-y-1 bg-green-500/5 p-3.5 rounded-xl text-center border border-green-500/10">
                <span className="text-[9px] text-green-600/70 dark:text-green-400/70 uppercase font-bold tracking-wider">Spent</span>
                <div className="text-sm font-black font-playfair text-green-600 dark:text-green-400">₹{formatINR(progressData.amountSpent)}</div>
              </div>
              <div className="space-y-1 bg-rosegold/5 dark:bg-goldAccent/5 p-3.5 rounded-xl text-center border border-rosegold/10 dark:border-goldAccent/10">
                <span className="text-[9px] text-rosegold/70 dark:text-goldAccent/70 uppercase font-bold tracking-wider">Remaining</span>
                <div className="text-sm font-black font-playfair text-rosegold dark:text-goldAccent">₹{formatINR(progressData.remainingBudget)}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* SVG Doughnut Chart */}
            <div className="sm:col-span-5 flex justify-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="var(--fallback-bg, #E2E8F0)" strokeWidth="4.5" className="stroke-cream dark:stroke-darkbg" />
                  {segments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="21"
                      cy="21"
                      r="15.9155"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="4.5"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      className="transition-all duration-300"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-playfair text-xs font-black text-darktext dark:text-white leading-none">Budget</span>
                  <span className="text-[8px] text-rosegold dark:text-goldAccent font-bold uppercase tracking-wider mt-1">Split</span>
                </div>
              </div>
            </div>

            {/* Categories & Progress legend */}
            <div className="sm:col-span-7 space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {segments.map((item, idx) => {
                const percent = item.allocated > 0 ? Math.min(Math.round((item.spent / item.allocated) * 100), 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-darktext dark:text-white font-playfair">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        {item.category}
                      </span>
                      <span className="text-[9px] text-darktext/50 dark:text-gray-400 font-semibold">
                        ₹{formatINR(item.spent)} / ₹{formatINR(item.allocated)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-cream dark:bg-darkbg overflow-hidden flex">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
              {segments.length === 0 && (
                <p className="text-center py-8 text-xs text-darktext/40 dark:text-gray-550 italic">No budget items allocated yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Vendors list management */}
      <div className="bg-white dark:bg-darkcard p-6 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-rosegold/10 dark:border-goldAccent/10 pb-4">
          <div>
            <h3 className="font-playfair font-bold text-base text-darktext dark:text-white">Assigned Vendors List</h3>
            <p className="text-[10px] text-darktext/50 dark:text-gray-400 mt-0.5">Assigned catering, decor, and entertainment vendors.</p>
          </div>
        </div>

        {(!event.vendors || event.vendors.length === 0) ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-darktext/50 dark:text-gray-400 italic">No vendors currently assigned to this event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.vendors.map((vendor) => (
              <div 
                key={vendor._id} 
                className="p-5 rounded-2xl border border-rosegold/15 dark:border-goldAccent/10 bg-cream/10 dark:bg-darkcard/20 hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Gold Top Stripe */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rosegold via-champagne to-rosegold opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-rosegold/10 text-rosegold dark:bg-goldAccent/10 dark:text-goldAccent text-[9px] font-bold tracking-wider uppercase border border-rosegold/15 dark:border-goldAccent/15">
                          {vendor.vendorType || 'Catering'}
                        </span>
                        {vendor.assignmentStatus && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                            vendor.assignmentStatus === 'Accepted' || vendor.assignmentStatus === 'Completed'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15'
                              : vendor.assignmentStatus === 'Pending'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/15'
                          }`}>
                            {vendor.assignmentStatus}
                          </span>
                        )}
                      </div>
                      <h4 className="font-playfair font-black text-sm text-darktext dark:text-white mt-2 truncate max-w-[200px]">
                        {vendor.businessName || 'Royal Decorators'}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs border-t border-rosegold/5 pt-3">
                    <div className="flex items-center text-darktext/60 dark:text-gray-400">
                      <FiUser className="w-3.5 h-3.5 mr-2.5 text-rosegold/70 dark:text-goldAccent/70" />
                      <span>{vendor.name?.name || 'Chef Pankaj'}</span>
                    </div>
                    <div className="flex items-center text-darktext/60 dark:text-gray-400 truncate">
                      <FiMail className="w-3.5 h-3.5 mr-2.5 text-rosegold/70 dark:text-goldAccent/70" />
                      <span className="truncate">{vendor.name?.email || 'vendor@example.com'}</span>
                    </div>
                    <div className="flex items-center text-darktext/60 dark:text-gray-400">
                      <FiPhone className="w-3.5 h-3.5 mr-2.5 text-rosegold/70 dark:text-goldAccent/70" />
                      <span>{vendor.name?.phoneNo || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-darktext/60 dark:text-gray-400">
                      <FiBriefcase className="w-3.5 h-3.5 mr-2.5 text-rosegold/70 dark:text-goldAccent/70" />
                      <span>Experience: {vendor.experience || '5+ Years'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Assign Planner */}
      <AnimatePresence>
        {isPlannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlannerModalOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-darkcard rounded-2xl max-w-sm w-full overflow-hidden border border-rosegold/20 dark:border-goldAccent/15 shadow-2xl z-10 p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-rosegold/10 dark:border-goldAccent/10 pb-4">
                <h3 className="font-playfair font-bold text-sm text-darktext dark:text-goldAccent">Assign Lead Planner</h3>
                <button
                  onClick={() => setIsPlannerModalOpen(false)}
                  className="p-1 rounded-lg text-darktext/40 hover:bg-cream dark:hover:bg-darkbg cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => handleAssignPlanner(null)}
                  className="w-full text-left p-3 rounded-xl border border-dashed border-red-500/35 hover:bg-red-500/5 text-xs text-red-500 font-bold transition-all cursor-pointer"
                >
                  -- Unassign Lead Planner --
                </button>
                
                {planners.map(p => (
                  <button
                    key={p._id}
                    onClick={() => handleAssignPlanner(p._id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      event.plannerId?._id === p._id
                        ? 'border-rosegold dark:border-goldAccent bg-rosegold/5 dark:bg-goldAccent/5'
                        : 'border-rosegold/15 dark:border-goldAccent/10 hover:border-rosegold dark:hover:border-goldAccent'
                    }`}
                  >
                    <div>
                      <h4 className="font-playfair font-bold text-xs text-darktext dark:text-white">{p.name?.name || 'Sophia Ross'}</h4>
                      <p className="text-[10px] text-darktext/50 dark:text-gray-400 mt-0.5">{p.companyName || 'Luxury Weddings'}</p>
                    </div>
                    {event.plannerId?._id === p._id && <FiCheckCircle className="w-4 h-4 text-rosegold dark:text-goldAccent" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Assign Vendor */}
      <AnimatePresence>
        {isVendorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVendorModalOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-darkcard rounded-2xl max-w-sm w-full overflow-hidden border border-rosegold/20 dark:border-goldAccent/15 shadow-2xl z-10 p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-rosegold/10 dark:border-goldAccent/10 pb-4">
                <h3 className="font-playfair font-bold text-sm text-darktext dark:text-goldAccent">Assign Vendor</h3>
                <button
                  onClick={() => setIsVendorModalOpen(false)}
                  className="p-1 rounded-lg text-darktext/40 hover:bg-cream dark:hover:bg-darkbg cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {vendorsList
                  .filter(v => !event.vendors?.some(av => av._id === v._id))
                  .map(v => (
                    <button
                      key={v._id}
                      onClick={() => handleAssignVendor(v._id)}
                      className="w-full text-left p-3 rounded-xl border border-rosegold/15 dark:border-goldAccent/10 hover:border-rosegold dark:hover:border-goldAccent transition-all flex justify-between items-center cursor-pointer"
                    >
                      <div>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-cream/70 dark:bg-darkbg text-rosegold dark:text-goldAccent border border-rosegold/10 dark:border-goldAccent/10">
                          {v.vendorType || 'Catering'}
                        </span>
                        <h4 className="font-playfair font-bold text-xs text-darktext dark:text-white mt-1.5">{v.businessName || 'Royal Services'}</h4>
                        <p className="text-[10px] text-darktext/50 dark:text-gray-400 mt-0.5">{v.name?.name || 'Chef Pankaj'}</p>
                      </div>
                      <FiPlus className="w-4 h-4 text-rosegold dark:text-goldAccent" />
                    </button>
                  ))}
                {vendorsList.filter(v => !event.vendors?.some(av => av._id === v._id)).length === 0 && (
                  <p className="text-center py-4 text-xs text-darktext/50 dark:text-gray-400 italic">No available vendors left to assign.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Client-Planner Chat History */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-darkcard rounded-2xl max-w-md w-full overflow-hidden border border-rosegold/20 dark:border-goldAccent/15 shadow-2xl z-10 flex flex-col h-[550px]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-rosegold/10 dark:border-goldAccent/10 bg-cream/10 dark:bg-darkcard/50">
                <div>
                  <h3 className="font-playfair font-bold text-sm text-darktext dark:text-goldAccent">Client-Planner Chat Log</h3>
                  <p className="text-[9px] text-darktext/40 dark:text-gray-400 mt-0.5 uppercase tracking-wide">
                    {event.clientId?.name?.name || 'Sarah'} ↔ {event.plannerId?.name?.name || 'Sophia'}
                  </p>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 rounded-lg text-darktext/40 hover:bg-cream dark:hover:bg-darkbg cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Message log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-ivory/10 dark:bg-darkbg/25">
                {chatLoading ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-rosegold/30 border-t-rosegold rounded-full animate-spin"></div></div>
                ) : chatHistory.length === 0 ? (
                  <p className="text-center py-16 text-xs text-darktext/45 dark:text-gray-400 italic">No message exchange history found in this conversation yet.</p>
                ) : (
                  chatHistory.map(msg => {
                    const isClient = msg.sender?.role === 'client';
                    return (
                      <div key={msg._id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col max-w-[80%] ${isClient ? 'items-end' : 'items-start'}`}>
                          <span className="text-[8px] text-darktext/40 dark:text-gray-400 font-bold mb-0.5 uppercase tracking-wider px-1">
                            {msg.sender?.name || 'User'}
                          </span>
                          <div className={`px-3 py-2 rounded-xl text-xs shadow-sm ${
                            isClient ? 'bg-rosegold text-white rounded-tr-none' : 'bg-cream/45 dark:bg-darkcard text-darktext dark:text-gray-200 border border-rosegold/10 dark:border-goldAccent/10 rounded-tl-none'
                          }`}>
                            {msg.message}
                          </div>
                          <span className="text-[8px] text-darktext/30 dark:text-gray-500 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Event */}
      <AnimatePresence>
        {isEditEventOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditEventOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-darkcard rounded-2xl max-w-md w-full border border-rosegold/20 dark:border-goldAccent/15 shadow-2xl z-10 p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-rosegold/10 dark:border-goldAccent/10 pb-4">
                <h3 className="font-playfair font-bold text-sm text-darktext dark:text-goldAccent">Edit Event Settings</h3>
                <button
                  onClick={() => setIsEditEventOpen(false)}
                  className="p-1 rounded-lg text-darktext/40 hover:bg-cream dark:hover:bg-darkbg cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Event Type</label>
                    <select
                      value={editForm.eventType}
                      onChange={(e) => setEditForm(prev => ({ ...prev, eventType: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Reception">Reception</option>
                      <option value="Sangeet">Sangeet</option>
                      <option value="Haldi">Haldi</option>
                      <option value="Mehendi">Mehendi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Target Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Guest Count</label>
                    <input
                      type="number"
                      value={editForm.guestCount}
                      onChange={(e) => setEditForm(prev => ({ ...prev, guestCount: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Venue</label>
                    <input
                      type="text"
                      value={editForm.venue}
                      onChange={(e) => setEditForm(prev => ({ ...prev, venue: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">City / Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Budget (INR) *</label>
                  <input
                    type="number"
                    required
                    value={editForm.budget}
                    onChange={(e) => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-rosegold/10 dark:border-goldAccent/10">
                  <button
                    type="button"
                    onClick={() => setIsEditEventOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-rosegold/25 dark:border-goldAccent/20 text-xs font-bold hover:bg-cream/30 dark:hover:bg-darkbg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rosegold text-white dark:bg-goldAccent dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminEventDetails;
