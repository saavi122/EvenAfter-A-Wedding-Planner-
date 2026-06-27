import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiUser, FiBriefcase, FiDollarSign, FiClock, FiMapPin, FiCalendar, 
  FiTrash2, FiPlus, FiMessageSquare, FiSettings, FiCheckCircle, FiAlertCircle, FiX, FiCheck
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

      setEvent(eventRes.data.data);
      setProgressData(progressRes.data.data);
      setPlanners(plannersRes.data.data || []);
      setVendorsList(vendorsRes.data.data || []);
      
      // Seed edit form values
      const e = eventRes.data.data;
      setEditForm({
        title: e.title || '',
        eventType: e.eventType || 'Wedding',
        date: e.date ? e.date.substring(0, 10) : '',
        venue: e.venue || '',
        location: e.location || '',
        budget: e.budget || '',
        guestCount: e.guestCount || '',
        status: e.status || 'Planning'
      });
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
          <button
            onClick={() => setIsEditEventOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rosegold text-white dark:bg-goldAccent dark:text-black text-xs font-bold hover:opacity-95 shadow-md cursor-pointer"
          >
            <FiSettings className="w-4 h-4" />
            Edit Event
          </button>
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
                  src={event.plannerId?.profileImage || "https://addyevents.in/wp-content/uploads/2025/07/NRI-WEdding-Planner-.jpg"} 
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
              <button
                onClick={() => setIsPlannerModalOpen(true)}
                className="px-4 py-1.5 rounded-lg border border-rosegold/30 dark:border-goldAccent/25 text-[11px] font-bold text-rosegold dark:text-goldAccent hover:bg-rosegold hover:text-white dark:hover:bg-goldAccent dark:hover:text-black transition-all cursor-pointer"
              >
                Assign Planner
              </button>
            </div>
          )}

          {event.plannerId && (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsPlannerModalOpen(true)}
                className="text-[10px] text-rosegold dark:text-goldAccent hover:underline font-bold cursor-pointer"
              >
                Change Lead Planner
              </button>
            </div>
          )}
        </div>

        {/* 3. Event Meta Details */}
        <div className="bg-white dark:bg-darkcard p-5 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-4">
          <div className="border-b border-rosegold/10 dark:border-goldAccent/10 pb-3 flex justify-between items-center">
            <h3 className="font-playfair font-bold text-xs uppercase tracking-wider text-rosegold dark:text-goldAccent">Quick Overview</h3>
            <FiClock className="w-4 h-4 text-rosegold/50 dark:text-goldAccent/50" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-darktext/50 dark:text-gray-400 flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5" /> Date:</span>
              <span className="font-bold">{event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'To Be Decided'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-darktext/50 dark:text-gray-400 flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5" /> City:</span>
              <span className="font-semibold">{event.location || 'Mumbai'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-darktext/50 dark:text-gray-400 flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5" /> Venue:</span>
              <span className="font-semibold truncate max-w-[150px]">{event.venue || 'TBD'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-darktext/50 dark:text-gray-400 flex items-center gap-1.5"><FiDollarSign className="w-3.5 h-3.5" /> Total Budget:</span>
              <span className="font-bold text-rosegold dark:text-goldAccent">₹{formatINR(event.budget)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-darktext/50 dark:text-gray-400 flex items-center gap-1.5"><FiUsers className="w-3.5 h-3.5" /> Guests:</span>
              <span className="font-bold">{event.guestCount || 0} Guests</span>
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
            <p className="text-[10px] text-darktext/50 dark:text-gray-400 mt-0.5">Toggle milestones status to update client planning progress.</p>
          </div>

          <div className="space-y-4 pl-2.5 relative border-l-2 border-rosegold/10 dark:border-goldAccent/10 ml-2">
            {event.timeline && event.timeline.map((item, idx) => (
              <div key={item._id || idx} className="relative pl-6 pb-2.5">
                <button
                  onClick={() => toggleTimelineStatus(idx, item.status)}
                  className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border cursor-pointer transition-all ${
                    item.status === 'Completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white dark:bg-darkcard border-rosegold/30 dark:border-goldAccent/25 text-rosegold/40 dark:text-goldAccent/35 hover:border-rosegold dark:hover:border-goldAccent'
                  }`}
                >
                  <FiCheck className="w-3 h-3" />
                </button>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-playfair text-xs font-bold text-darktext dark:text-white">{item.title}</h4>
                    <span className="text-[9px] text-darktext/40 dark:text-gray-500 font-medium">
                      {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                  <p className="text-[10px] text-darktext/50 dark:text-gray-400 leading-normal">{item.description}</p>
                </div>
              </div>
            ))}
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

          {/* Categories Progress list */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {event.budgetItems && event.budgetItems.map((item, idx) => {
              const allocated = item.allocated || 0;
              const spent = item.spent || 0;
              const percent = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;
              
              return (
                <div key={item._id || idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-darktext dark:text-white font-playfair">{item.category}</span>
                    <span className="text-[10px] text-darktext/60 dark:text-gray-400 font-medium">
                      Spent: <strong className="text-darktext dark:text-white font-bold">₹{formatINR(spent)}</strong> of ₹{formatINR(allocated)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cream dark:bg-darkbg overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-rosegold dark:bg-goldAccent'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Vendors list management */}
      <div className="bg-white dark:bg-darkcard p-6 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-rosegold/10 dark:border-goldAccent/10 pb-4">
          <div>
            <h3 className="font-playfair font-bold text-base text-darktext dark:text-white">Assigned Vendors List</h3>
            <p className="text-[10px] text-darktext/50 dark:text-gray-400 mt-0.5">Manage and supervise catering, decor, and entertainment vendors.</p>
          </div>
          <button
            onClick={() => setIsVendorModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rosegold text-white dark:bg-goldAccent dark:text-black font-semibold text-xs hover:opacity-95 cursor-pointer shadow-sm"
          >
            <FiPlus className="w-3.5 h-3.5" />
            Assign Vendor
          </button>
        </div>

        {(!event.vendors || event.vendors.length === 0) ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-darktext/50 dark:text-gray-400 italic">No vendors currently assigned to this event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.vendors.map((vendor) => (
              <div 
                key={vendor._id} 
                className="p-4 rounded-xl border border-rosegold/15 dark:border-goldAccent/10 bg-ivory/20 dark:bg-darkbg/40 flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-rosegold/10 text-rosegold dark:bg-goldAccent/10 dark:text-goldAccent text-[9px] font-bold tracking-wider uppercase border border-rosegold/15 dark:border-goldAccent/15">
                        {vendor.vendorType || 'Catering'}
                      </span>
                      <h4 className="font-playfair font-black text-sm text-darktext dark:text-white mt-1.5 truncate max-w-[170px]">
                        {vendor.businessName || 'Royal Decorators'}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleRemoveVendor(vendor._id)}
                      title="Unassign vendor"
                      className="p-1.5 rounded-lg text-darktext/30 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px] text-darktext/60 dark:text-gray-400">
                    <div>Provided by: <strong className="text-darktext dark:text-gray-300 font-semibold">{vendor.name?.name || 'Chef Pankaj'}</strong></div>
                    <div className="truncate">Email: {vendor.name?.email || 'vendor@example.com'}</div>
                    <div>Phone: {vendor.name?.phoneNo || 'N/A'}</div>
                    <div>Experience: {vendor.experience || '5+ Years'}</div>
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
