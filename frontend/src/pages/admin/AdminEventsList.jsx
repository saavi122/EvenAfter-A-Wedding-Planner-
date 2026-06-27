import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiCalendar, FiDollarSign, FiPlus, FiTrash2, 
  FiEye, FiTrendingUp, FiCheckCircle, FiClock, FiUsers, FiMapPin, FiActivity, FiX, FiCheck
} from 'react-icons/fi';
import api from '../../services/api';

const formatINR = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

export const AdminEventsList = () => {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [planners, setPlanners] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterPlanner, setFilterPlanner] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    clientId: '',
    title: '',
    eventType: 'Wedding',
    date: '',
    venue: '',
    location: '',
    budget: '',
    guestCount: '',
    status: 'Planning',
    plannerId: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  
  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    upcoming: 0,
    clients: 0,
    planners: 0,
    vendors: 0,
    revenue: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query string
      let queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (filterType) queryParams.push(`eventType=${encodeURIComponent(filterType)}`);
      if (filterStatus) queryParams.push(`status=${encodeURIComponent(filterStatus)}`);
      if (filterClient) queryParams.push(`clientId=${encodeURIComponent(filterClient)}`);
      if (filterPlanner) queryParams.push(`plannerId=${encodeURIComponent(filterPlanner)}`);
      if (filterCity) queryParams.push(`city=${encodeURIComponent(filterCity)}`);
      if (minBudget) queryParams.push(`minBudget=${minBudget}`);
      if (maxBudget) queryParams.push(`maxBudget=${maxBudget}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

      const [eventsRes, clientsRes, plannersRes, vendorsRes] = await Promise.all([
        api.get(`/admin/events${queryString}`),
        api.get('/admin/clients'),
        api.get('/admin/planners'),
        api.get('/admin/vendors')
      ]);

      const eventsList = eventsRes.data.data || [];
      setEvents(eventsList);
      setClients(clientsRes.data.data || []);
      setPlanners(plannersRes.data.data || []);
      setVendors(vendorsRes.data.data || []);

      // Calculate statistics based on fetched events list
      const total = eventsList.length;
      const active = eventsList.filter(e => e.status === 'Ongoing' || e.status === 'Planning').length;
      const completed = eventsList.filter(e => e.status === 'Completed').length;
      const upcoming = eventsList.filter(e => e.date && new Date(e.date) > new Date()).length;
      
      const totalBudgetSum = eventsList.reduce((acc, curr) => acc + (curr.budget || 0), 0);
      const revenue = totalBudgetSum * 0.05; // 5% platform commission

      setStats({
        total,
        active,
        completed,
        upcoming,
        clients: clientsRes.data.data?.length || 0,
        planners: plannersRes.data.data?.length || 0,
        vendors: vendorsRes.data.data?.length || 0,
        revenue
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterType, filterStatus, filterClient, filterPlanner, filterCity, minBudget, maxBudget]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!createForm.clientId || !createForm.title) {
      alert("Client and Event Title are required.");
      return;
    }

    setCreateLoading(true);
    try {
      await api.post('/admin/events', createForm);
      setIsCreateOpen(false);
      setCreateForm({
        clientId: '',
        title: '',
        eventType: 'Wedding',
        date: '',
        venue: '',
        location: '',
        budget: '',
        guestCount: '',
        status: 'Planning',
        plannerId: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create event. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.delete(`/admin/events/${id}`);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete event.');
    }
  };

  return (
    <div className="space-y-8 pb-12 text-darktext dark:text-gray-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold tracking-wide text-darktext dark:text-goldAccent">
            Event Management Dashboard
          </h2>
          <p className="font-roboto text-xs text-darktext/60 dark:text-gray-400">
            Monitor, edit, assign planners/vendors, and track progress of all platform weddings & celebrations.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rosegold text-white dark:bg-goldAccent dark:text-black font-semibold text-sm hover:opacity-95 shadow-md cursor-pointer flex-shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Stats Cards Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', val: stats.total, sub: `${stats.upcoming} Upcoming`, icon: FiActivity, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Active / Ongoing', val: stats.active, sub: `${stats.completed} Completed`, icon: FiClock, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Platform Revenue', val: `₹${formatINR(stats.revenue)}`, sub: '5% Platform Fee', icon: FiTrendingUp, color: 'text-green-500 bg-green-500/10' },
          { label: 'Platform Users', val: stats.clients + stats.planners + stats.vendors, sub: `${stats.planners} Planners • ${stats.vendors} Vendors`, icon: FiUsers, color: 'text-purple-500 bg-purple-500/10' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-darkcard p-5 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-darktext/50 dark:text-gray-400">{item.label}</span>
              <div className={`p-2 rounded-lg ${item.color}`}><item.icon className="w-4 h-4" /></div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-darktext dark:text-white font-playfair">{item.val}</h3>
              <p className="text-[10px] text-darktext/40 dark:text-gray-500 font-medium">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters block */}
      <div className="bg-white dark:bg-darkcard p-5 rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3.5 top-3.5 text-darktext/40 dark:text-gray-550 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event title, venue, city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/20 dark:bg-darkbg text-sm text-darktext dark:text-white focus:outline-none focus:ring-1 focus:ring-rosegold/50 dark:focus:ring-goldAccent/50"
            />
          </div>
          <div className="flex flex-wrap gap-2.5">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/20 dark:bg-darkbg text-xs font-semibold text-darktext dark:text-white focus:outline-none"
            >
              <option value="">All Event Types</option>
              <option value="Wedding">Wedding</option>
              <option value="Engagement">Engagement</option>
              <option value="Reception">Reception</option>
              <option value="Sangeet">Sangeet</option>
              <option value="Haldi">Haldi</option>
              <option value="Mehendi">Mehendi</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/20 dark:bg-darkbg text-xs font-semibold text-darktext dark:text-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/20 dark:bg-darkbg text-xs font-semibold text-darktext dark:text-white max-w-[150px] focus:outline-none"
            >
              <option value="">All Clients</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name?.name || 'Client'}</option>
              ))}
            </select>

            <select
              value={filterPlanner}
              onChange={(e) => setFilterPlanner(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/20 dark:bg-darkbg text-xs font-semibold text-darktext dark:text-white max-w-[150px] focus:outline-none"
            >
              <option value="">All Planners</option>
              {planners.map(p => (
                <option key={p._id} value={p._id}>{p.name?.name || 'Planner'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-1.5 border-t border-rosegold/10 dark:border-goldAccent/10 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-darktext/50 dark:text-gray-400">Budget Range:</span>
            <input
              type="number"
              placeholder="Min"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="w-24 px-2 py-1.5 rounded-lg border border-rosegold/25 dark:border-goldAccent/20 bg-cream/25 dark:bg-darkbg focus:outline-none text-xs"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-24 px-2 py-1.5 rounded-lg border border-rosegold/25 dark:border-goldAccent/20 bg-cream/25 dark:bg-darkbg focus:outline-none text-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-medium text-darktext/50 dark:text-gray-400">City:</span>
            <input
              type="text"
              placeholder="e.g. Goa, Jodhpur"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-32 px-2.5 py-1.5 rounded-lg border border-rosegold/25 dark:border-goldAccent/20 bg-cream/25 dark:bg-darkbg focus:outline-none text-xs"
            />
          </div>
        </div>
      </div>

      {/* Events table */}
      <div className="bg-white dark:bg-darkcard rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-14 bg-cream/20 dark:bg-darkbg/50 rounded-xl animate-pulse w-full"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cream dark:bg-darkbg flex items-center justify-center mx-auto text-rosegold dark:text-goldAccent">
              <FiCalendar className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-playfair font-bold text-lg text-darktext dark:text-white">No Events Found</h3>
              <p className="text-xs text-darktext/50 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                We couldn't find any events matching your selected search terms or filters. Try adjusting your query parameters.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-cream/40 dark:bg-darkcard/60 text-[10px] font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 border-b border-rosegold/10 dark:border-goldAccent/10">
                  <th className="px-6 py-4">Event ID / Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Planner</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rosegold/10 dark:divide-goldAccent/10 text-xs">
                {events.map((e) => (
                  <tr key={e._id} className="hover:bg-cream/15 dark:hover:bg-darkcard/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      <div className="font-playfair text-sm text-darktext dark:text-white">{e.title}</div>
                      <div className="text-[9px] font-mono text-darktext/40 dark:text-gray-500 mt-0.5">{e._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-cream/70 dark:bg-darkbg text-[10px] font-semibold text-rosegold dark:text-goldAccent border border-rosegold/10 dark:border-goldAccent/10">
                        {e.eventType || 'Wedding'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {e.clientId?.name?.name || 'Sarah Miller'}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {e.plannerId?.name?.name ? (
                        <span className="text-darktext dark:text-gray-300">{e.plannerId.name.name}</span>
                      ) : (
                        <span className="text-red-500/80 font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ₹{formatINR(e.budget)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3 text-rosegold dark:text-goldAccent" />
                        {e.location || 'Jodhpur, Rajasthan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-darktext/70 dark:text-gray-400">
                      {e.date ? new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        e.status === 'Completed'
                          ? 'bg-green-500/10 text-green-500'
                          : e.status === 'Ongoing'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/admin/events/${e._id}`}
                          title="View event details"
                          className="p-1.5 rounded-lg bg-cream dark:bg-darkbg text-rosegold dark:text-goldAccent hover:opacity-90 transition-all"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(e._id)}
                          title="Delete event"
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-darkcard rounded-2xl max-w-lg w-full overflow-hidden border border-rosegold/20 dark:border-goldAccent/15 shadow-2xl z-10 p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-rosegold/10 dark:border-goldAccent/10 pb-4">
                <h3 className="font-playfair font-bold text-lg text-darktext dark:text-goldAccent">Initialize New Event</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-lg text-darktext/50 hover:bg-cream dark:hover:bg-darkbg transition-all cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Client Profile *</label>
                  <select
                    required
                    value={createForm.clientId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>{c.name?.name || 'Sarah Miller'} ({c.email?.email || c.clientId})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Event Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah & David's Reception"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Event Type</label>
                    <select
                      value={createForm.eventType}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, eventType: e.target.value }))}
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Target Date</label>
                    <input
                      type="date"
                      value={createForm.date}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Guest Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      value={createForm.guestCount}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, guestCount: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Venue</label>
                    <input
                      type="text"
                      placeholder="e.g. Taj Mahal Palace"
                      value={createForm.venue}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, venue: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={createForm.location}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Budget (INR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500000"
                      value={createForm.budget}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-darktext/60 dark:text-gray-400 mb-1.5">Assign Lead Planner</label>
                    <select
                      value={createForm.plannerId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, plannerId: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/10 dark:bg-darkbg text-sm focus:outline-none"
                    >
                      <option value="">-- Leave Unassigned --</option>
                      {planners.map(p => (
                        <option key={p._id} value={p._id}>{p.name?.name || 'Sophia Ross'} ({p.city || 'Available'})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-rosegold/10 dark:border-goldAccent/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-rosegold/25 dark:border-goldAccent/20 text-xs font-bold hover:bg-cream/30 dark:hover:bg-darkbg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2.5 rounded-xl bg-rosegold text-white dark:bg-goldAccent dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {createLoading ? 'Creating...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-darkcard rounded-2xl max-w-sm w-full p-6 border border-rosegold/20 dark:border-goldAccent/15 shadow-2xl z-10 text-center space-y-5"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <FiTrash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-playfair font-bold text-base text-darktext dark:text-white">Delete Wedding Event?</h3>
                <p className="text-xs text-darktext/50 dark:text-gray-400 leading-relaxed">
                  Are you sure you want to permanently delete this event? This action will also delete all associated planner timeline steps and checklist tasks.
                </p>
              </div>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl border border-rosegold/25 dark:border-goldAccent/20 text-xs font-bold hover:bg-cream/30 dark:hover:bg-darkbg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteEvent(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 cursor-pointer animate-pulse"
                >
                  Delete Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminEventsList;
