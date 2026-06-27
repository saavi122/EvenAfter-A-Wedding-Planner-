import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, FiMapPin, FiCalendar, FiMessageSquare, FiBriefcase, 
  FiUserCheck, FiChevronRight, FiCheck, FiX, FiAward, FiGlobe, 
  FiHeart, FiCompass, FiSmile, FiShield, FiPhone, FiMail, FiShare2, FiGrid, FiClock, FiPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const PlannerProfile = () => {
  const { plannerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Selected portfolio category filter
  const [portfolioFilter, setPortfolioFilter] = useState('All');

  // Lightbox zoom state
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Modal triggers
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isHireOpen, setIsHireOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [meetingForm, setMeetingForm] = useState({ date: '', time: '', agenda: '', meetingType: 'Google Meet' });
  const [hireForm, setHireForm] = useState({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });

  // Open booking modal if "?book=true" is passed in query string
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('book') === 'true') {
      setIsMeetingOpen(true);
    }
  }, [location.search]);

  // 1. Fetch planner profile details
  const { data: plannerResponse, isLoading: plannerLoading } = useQuery({
    queryKey: ['planner', plannerId],
    queryFn: async () => {
      const res = await fetch(`/api/planners/${plannerId}`);
      if (!res.ok) throw new Error('Failed to load planner profile');
      return res.json();
    }
  });

  const planner = plannerResponse?.data;

  // 2. Fetch portfolio data
  const { data: portfolioResponse, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', plannerId],
    queryFn: async () => {
      const res = await fetch(`/api/planners/${plannerId}/portfolio`);
      if (!res.ok) throw new Error('Failed to load portfolio');
      return res.json();
    },
    enabled: !!plannerId
  });

  const portfolio = portfolioResponse?.data || { images: [], videos: [], testimonials: [] };

  // 3. Fetch reviews data
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', plannerId],
    queryFn: async () => {
      const res = await fetch(`/api/planners/${plannerId}/reviews`);
      if (!res.ok) throw new Error('Failed to load reviews');
      return res.json();
    },
    enabled: !!plannerId
  });

  const reviews = reviewsResponse?.data || [];

  // 4. Fetch dynamic events history data
  const { data: eventsResponse, isLoading: eventsLoading } = useQuery({
    queryKey: ['plannerEvents', plannerId],
    queryFn: async () => {
      const res = await fetch(`/api/planners/${plannerId}/events`);
      if (!res.ok) throw new Error('Failed to load events');
      return res.json();
    },
    enabled: !!plannerId
  });

  const events = eventsResponse?.data || [];

  // Mutations
  const scheduleMeetingMutation = useMutation({
    mutationFn: async (meetingData) => {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meetingData, plannerId: planner._id })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to schedule meeting');
      return result;
    },
    onSuccess: () => {
      toast.success("Consultation meeting scheduled! Coordinator notified.");
      setIsMeetingOpen(false);
      setMeetingForm({ date: '', time: '', agenda: '', meetingType: 'Google Meet' });
      queryClient.invalidateQueries({ queryKey: ['myPlanner'] });
    },
    onError: (err) => {
      toast.error(err.message || "Error scheduling meeting");
    }
  });

  const hirePlannerMutation = useMutation({
    mutationFn: async (requestData) => {
      const res = await fetch('/api/planner-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestData, plannerId: planner._id })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to send request');
      return result;
    },
    onSuccess: () => {
      toast.success("Hiring proposal submitted successfully!");
      setIsHireOpen(false);
      setHireForm({ weddingType: 'Luxury Wedding', weddingDate: '', location: '', budget: '', requirements: '' });
    },
    onError: (err) => {
      toast.error(err.message || "Error sending proposal");
    }
  });

  const handleMeetingSubmit = (e) => {
    e.preventDefault();
    scheduleMeetingMutation.mutate(meetingForm);
  };

  const handleHireSubmit = (e) => {
    e.preventDefault();
    hirePlannerMutation.mutate(hireForm);
  };

  const toggleSavePlanner = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success("Planner saved to your favorites!");
    } else {
      toast.success("Planner removed from your favorites.");
    }
  };

  if (plannerLoading || portfolioLoading || reviewsLoading || eventsLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center bg-ivory dark:bg-darkbg">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-rosegold/20 border-t-rosegold dark:border-goldAccent/20 dark:border-t-goldAccent animate-spin" />
          <p className="font-playfair text-xs tracking-widest text-rosegold dark:text-goldAccent uppercase animate-pulse">Curating coordinator profile...</p>
        </div>
      </div>
    );
  }

  if (!planner) {
    return (
      <div className="text-center py-16 bg-ivory dark:bg-darkbg min-h-[60vh] flex flex-col items-center justify-center text-[#5c4033] dark:text-goldAccent">
        <h3 className="text-lg font-bold font-playfair">Planner profile not found</h3>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold rounded text-xs shadow">
          Go Back
        </button>
      </div>
    );
  }

  // Predefined lists or dynamic fallbacks
  const specializationsList = planner.specializations?.length > 0
    ? planner.specializations
    : ["Destination Weddings", "Luxury Weddings", "Traditional Weddings", "Corporate Events", "Engagement Ceremonies"];

  const servicesList = planner.servicesOffered?.length > 0
    ? planner.servicesOffered
    : ["Full Wedding Planning", "Venue Selection", "Decoration", "Catering Coordination", "Photography Coordination", "Guest Management", "Entertainment Planning"];

  const citiesServedList = planner.citiesServed?.length > 0
    ? planner.citiesServed
    : ["Mumbai", "Goa", "Udaipur", "Delhi", "Jaipur"];

  // Filter events based on filter selection
  const filteredEvents = portfolioFilter === 'All'
    ? events
    : events.filter(e => e.eventType === portfolioFilter);

  // Derive unique event types for filters
  const eventTypes = ['All', ...new Set(events.map(e => e.eventType).filter(Boolean))];

  // Default images for gallery if portfolio is empty
  const defaultGallery = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600",
    "https://images.unsplash.com/photo-1507504038482-7621c5b9e078?q=80&w=600",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600"
  ];

  const galleryImages = portfolio.images?.length > 0 ? portfolio.images : defaultGallery;

  // Contact links fallback
  const phone = planner.contactDetails?.phone || planner.userId?.phoneNo || "+91 98765 43210";
  const email = planner.contactDetails?.email || planner.userId?.email || "planner@weddingplatform.com";
  const website = planner.contactDetails?.website || "www.fairytale-vows.com";
  const socials = planner.contactDetails?.socials || { instagram: "instagram.com/wedding_curator", facebook: "facebook.com/wedding_curator", linkedin: "linkedin.com/in/wedding_curator" };

  return (
    <div className="space-y-10 pb-16 font-roboto bg-ivory/20 dark:bg-darkbg/10 min-h-screen">
      
      {/* Hero Banner with Profile Cover */}
      <div className="relative rounded-3xl overflow-hidden h-[280px] md:h-[380px] border border-rosegold/20 dark:border-goldAccent/15 shadow-lg">
        <img 
          src={planner.coverImage || "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200"}
          alt="Wedding Cover"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
        
        {/* Soft overlay quote */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
          <span className="font-playfair text-white text-xl md:text-3xl font-light italic tracking-wider max-w-2xl leading-relaxed">
            "Crafting unforgettable moments, curating majestic memories."
          </span>
          <div className="mt-4 flex items-center space-x-2">
            <span className="h-px bg-goldAccent/40 w-12" />
            <span className="text-goldAccent text-xs uppercase tracking-widest font-semibold font-playfair">Fairytale Weddings</span>
            <span className="h-px bg-goldAccent/40 w-12" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start px-1 md:px-4">
        
        {/* ================================================= */}
        {/* LEFT COLUMN: BASIC INFO, CONTACT, SPECIALTIES    */}
        {/* ================================================= */}
        <div className="lg:col-span-4 space-y-8 flex flex-col items-center text-center lg:items-stretch lg:text-left">
          
          {/* Profile Picture Overlap */}
          <div className="relative w-full max-w-[260px] lg:max-w-none aspect-[4/5] rounded-t-full rounded-b-3xl overflow-hidden border-4 border-white dark:border-darkcard shadow-2xl bg-cream/40 mx-auto -mt-24 lg:-mt-36 z-20">
            <img
              src={planner.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"}
              alt={planner.name?.name || "Wedding Curator"}
              className="w-full h-full object-cover"
            />
            {planner.status === 'active' && (
              <div className="absolute bottom-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg flex items-center justify-center border-2 border-white" title="Verified Professional">
                <FiUserCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Name & Company */}
          <div className="space-y-2 mt-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <h2 className="text-3xl font-extrabold font-playfair tracking-wide text-darktext dark:text-goldAccent">
                {planner.name?.name || planner.companyName}
              </h2>
              {planner.status === 'active' && (
                <span className="px-2 py-0.5 bg-rosegold/10 text-rosegold dark:text-goldAccent dark:bg-goldAccent/10 text-[9px] uppercase tracking-widest font-black rounded-full border border-rosegold/20">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs font-semibold tracking-widest text-rosegold dark:text-goldAccent/80 uppercase">
              {planner.companyName || "Elite Wedding & Events Group"}
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-darktext/50 dark:text-gray-400">
              <FiMapPin className="text-rosegold dark:text-goldAccent" />
              <span>{planner.city || "Mumbai, India"}</span>
            </div>
          </div>

          {/* Experience Statistics */}
          <div className="w-full border border-rosegold/20 dark:border-goldAccent/15 rounded-3xl bg-cream/15 dark:bg-darkcard/40 p-5 space-y-4 shadow-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent border-b border-rosegold/10 dark:border-goldAccent/10 pb-2">Experience & Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white/40 dark:bg-black/10 rounded-2xl border border-rosegold/10">
                <p className="text-xl font-bold font-playfair text-rosegold dark:text-goldAccent">{planner.exprience || planner.experience || "8+ Years"}</p>
                <p className="text-[9px] text-darktext/65 uppercase tracking-wider mt-1">Experience</p>
              </div>
              <div className="p-3 bg-white/40 dark:bg-black/10 rounded-2xl border border-rosegold/10">
                <p className="text-xl font-bold font-playfair text-rosegold dark:text-goldAccent">{planner.assignedEvents || events.length || 150}</p>
                <p className="text-[9px] text-darktext/65 uppercase tracking-wider mt-1">Events Planned</p>
              </div>
              <div className="p-3 bg-white/40 dark:bg-black/10 rounded-2xl border border-rosegold/10">
                <p className="text-xl font-bold font-playfair text-rosegold dark:text-goldAccent">{planner.happyClients || 140}</p>
                <p className="text-[9px] text-darktext/65 uppercase tracking-wider mt-1">Happy Clients</p>
              </div>
              <div className="p-3 bg-white/40 dark:bg-black/10 rounded-2xl border border-rosegold/10">
                <p className="text-xl font-bold font-playfair text-rosegold dark:text-goldAccent flex items-center justify-center">
                  <FiStar className="fill-current text-amber-500 mr-1 w-4 h-4" />
                  {planner.ratings || "5.0"}
                </p>
                <p className="text-[9px] text-darktext/65 uppercase tracking-wider mt-1">Client Rating</p>
              </div>
            </div>
            <div className="pt-2 text-center text-xs font-semibold text-darktext/65 border-t border-rosegold/10">
              <p>Serving Cities: {citiesServedList.join(', ')}</p>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="w-full border border-rosegold/20 dark:border-goldAccent/15 rounded-3xl bg-cream/15 dark:bg-darkcard/40 p-5 space-y-4 shadow-sm text-xs">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent border-b border-rosegold/10 dark:border-goldAccent/10 pb-2">Contact Details</h4>
            
            <div className="space-y-3">
              <a href={`tel:${phone}`} className="flex items-center space-x-3 text-darktext/80 dark:text-gray-300 hover:text-rosegold transition-colors">
                <span className="p-2 rounded-xl bg-rosegold/10 dark:bg-goldAccent/10 text-rosegold dark:text-goldAccent">
                  <FiPhone className="w-4 h-4" />
                </span>
                <span className="font-semibold">{phone}</span>
              </a>
              
              <a href={`mailto:${email}`} className="flex items-center space-x-3 text-darktext/80 dark:text-gray-300 hover:text-rosegold transition-colors">
                <span className="p-2 rounded-xl bg-rosegold/10 dark:bg-goldAccent/10 text-rosegold dark:text-goldAccent">
                  <FiMail className="w-4 h-4" />
                </span>
                <span className="font-semibold break-all">{email}</span>
              </a>

              {website && (
                <a href={`https://${website}`} target="_blank" rel="noreferrer" className="flex items-center space-x-3 text-darktext/80 dark:text-gray-300 hover:text-rosegold transition-colors">
                  <span className="p-2 rounded-xl bg-rosegold/10 dark:bg-goldAccent/10 text-rosegold dark:text-goldAccent">
                    <FiGlobe className="w-4 h-4" />
                  </span>
                  <span className="font-semibold">{website}</span>
                </a>
              )}
            </div>

            {/* Social media links */}
            <div className="flex justify-center space-x-4 pt-3 border-t border-rosegold/10">
              {Object.entries(socials).map(([platform, url]) => (
                <a key={platform} href={`https://${url}`} target="_blank" rel="noreferrer" className="text-darktext/60 hover:text-rosegold dark:hover:text-goldAccent capitalize text-[10px] font-bold tracking-wider">
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Philosophy / Bio Section */}
          <div className="w-full border border-rosegold/20 dark:border-goldAccent/15 rounded-3xl bg-cream/15 dark:bg-darkcard/40 p-6 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent border-b border-rosegold/10 dark:border-goldAccent/10 pb-2">About Curator</h4>
            <p className="text-xs leading-relaxed text-darktext/75 dark:text-gray-350 italic">
              "{planner.bio || 'I believe that planning a wedding is about curating details that reflect who you are. With precise design, floral accents, and royal logistics, we construct your grand fairytale.'}"
            </p>
          </div>

        </div>

        {/* ================================================= */}
        {/* RIGHT COLUMN: SPECS, PORTFOLIO & REVIEWS          */}
        {/* ================================================= */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Role-Based Actions Header */}
          <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
            {/* Show Booking & Hiring actions only for Clients */}
            {user?.role === 'client' && (
              <>
                <button
                  onClick={() => navigate(`/client/chat/${planner.userId?._id || planner.name?._id}`)}
                  className="px-6 py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded-2xl shadow hover:opacity-90 flex items-center space-x-1.5 transition-all"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  <span>Chat Planner</span>
                </button>
                
                <button
                  onClick={() => setIsMeetingOpen(true)}
                  className="px-6 py-3 bg-transparent border border-rosegold dark:border-goldAccent text-rosegold dark:text-goldAccent font-semibold text-xs uppercase tracking-widest rounded-2xl hover:bg-rosegold/5 transition-all"
                >
                  Schedule Call
                </button>

                <button
                  onClick={() => setIsHireOpen(true)}
                  className="px-6 py-3 bg-[#4A403A] text-white font-semibold text-xs uppercase tracking-widest rounded-2xl shadow hover:bg-opacity-95 transition-all"
                >
                  Hire Planner
                </button>

                <button
                  onClick={toggleSavePlanner}
                  className={`px-5 py-3 border rounded-2xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                    isSaved 
                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20' 
                      : 'border-rosegold text-rosegold hover:bg-rosegold/5'
                  }`}
                >
                  <FiHeart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Planner'}</span>
                </button>
              </>
            )}

            {/* Show respond/chat only for Vendors */}
            {user?.role === 'vendor' && (
              <>
                <button
                  onClick={() => navigate(`/vendor/chat/${planner.userId?._id || planner.name?._id}`)}
                  className="px-6 py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded-2xl shadow hover:opacity-90 flex items-center space-x-1.5 transition-all"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  <span>Send Inquiries</span>
                </button>
                <button
                  onClick={() => {
                    toast.success("Respond request sent! Planner notified.");
                  }}
                  className="px-6 py-3 bg-transparent border border-rosegold dark:border-goldAccent text-rosegold dark:text-goldAccent font-semibold text-xs uppercase tracking-widest rounded-2xl hover:bg-rosegold/5 transition-all"
                >
                  Respond to Planner Requests
                </button>
              </>
            )}

            {/* Read-only fallback or Planner self view */}
            {user?.role === 'planner' && (
              <span className="text-xs font-semibold text-darktext/50 italic">
                Viewing public profile preview mode.
              </span>
            )}
          </div>

          {/* Specialties & Services Offered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Specialiazations */}
            <div className="p-6 border border-rosegold/20 rounded-3xl bg-cream/5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair flex items-center">
                <FiAward className="mr-2 text-rosegold" /> Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {specializationsList.map((spec) => (
                  <span key={spec} className="px-3 py-1.5 bg-rosegold/5 border border-rosegold/10 text-darktext/80 rounded-xl text-[10px] font-bold">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="p-6 border border-rosegold/20 rounded-3xl bg-cream/5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair flex items-center">
                <FiCompass className="mr-2 text-rosegold" /> Services Offered
              </h3>
              <div className="flex flex-wrap gap-2">
                {servicesList.map((service) => (
                  <span key={service} className="px-3 py-1.5 bg-rosegold/5 border border-rosegold/10 text-darktext/80 rounded-xl text-[10px] font-bold">
                    {service}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Past Events Portfolio Grid */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-rosegold/20 dark:border-goldAccent/15 pb-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair">
                  Past Events Portfolio
                </h3>
                <p className="text-[10px] text-darktext/50">Showcasing completed dream weddings</p>
              </div>

              {/* Event types category selector */}
              <div className="flex flex-wrap gap-1.5">
                {eventTypes.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioFilter(cat)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all border ${
                      portfolioFilter === cat
                        ? 'bg-rosegold border-rosegold text-white dark:bg-goldAccent dark:border-goldAccent dark:text-black shadow-sm'
                        : 'bg-white dark:bg-darkcard border-rosegold/20 text-darktext/60 dark:text-gray-400 hover:text-rosegold'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Cards */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((ev, index) => (
                  <div key={index} className="rounded-3xl border border-rosegold/20 bg-white dark:bg-darkcard overflow-hidden shadow-sm flex flex-col justify-between">
                    
                    {/* Event Images Row (shows first or multiple if exists) */}
                    <div className="relative h-48 bg-cream/10">
                      <img 
                        src={ev.gallery?.[0] || "https://images.unsplash.com/photo-1519225495810-7517c300ea97?q=80&w=600"} 
                        alt={ev.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-bold text-white uppercase tracking-widest">
                        {ev.eventType || 'Wedding'}
                      </div>
                    </div>

                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-sm font-extrabold text-darktext dark:text-white font-playfair">
                          {ev.name}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-darktext/60">
                          <span className="flex items-center"><FiMapPin className="mr-1 text-rosegold" /> {ev.venue}</span>
                          <span className="flex items-center"><FiCalendar className="mr-1 text-rosegold" /> {new Date(ev.date).toLocaleDateString()}</span>
                          <span className="flex items-center font-bold text-rosegold dark:text-goldAccent">Budget: ₹{ev.budget?.toLocaleString() || "7,500,000"}</span>
                          <span className="flex items-center"><FiSmile className="mr-1 text-rosegold" /> {ev.guestCount} Guests</span>
                        </div>
                      </div>

                      {/* Client Feedback */}
                      {ev.clientFeedback && (
                        <div className="p-3 bg-cream/20 dark:bg-black/25 rounded-2xl border border-rosegold/10 italic text-[11px] text-darktext/75">
                          "{ev.clientFeedback}"
                        </div>
                      )}

                      {/* Collaborating Vendors */}
                      {ev.vendorsCollaborated?.length > 0 && (
                        <div className="pt-2 border-t border-rosegold/10 text-[9px]">
                          <span className="font-bold uppercase tracking-wider text-rosegold block mb-1">Vendors Collaborated</span>
                          <div className="flex flex-wrap gap-1">
                            {ev.vendorsCollaborated.map((v, i) => (
                              <span key={i} className="px-2 py-0.5 bg-rosegold/5 rounded border border-rosegold/10 text-darktext/65">
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-cream/10 border border-dashed border-rosegold/30 rounded-3xl text-xs text-darktext/50">
                <p>No weddings logged under "{portfolioFilter}" yet.</p>
              </div>
            )}
          </div>

          {/* Portfolio Masonry Gallery */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair flex items-center">
              <FiGrid className="mr-2 text-rosegold" /> Inspiration Portfolio Gallery
            </h3>
            <div className="columns-2 sm:columns-3 gap-4 space-y-4">
              {galleryImages.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => setActiveLightbox({ url: imgUrl })}
                  className="break-inside-avoid relative overflow-hidden rounded-2xl border border-rosegold/25 shadow-sm cursor-pointer group bg-cream/10"
                >
                  <img
                    src={imgUrl}
                    alt={`gallery-inspiration-${index}`}
                    className="w-full object-cover group-hover:scale-102 transition-transform duration-500 rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-rosegold/90 dark:bg-goldAccent dark:text-black px-3.5 py-2 rounded-full shadow border border-white/20">
                      Zoom Image
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews & Client Ratings */}
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent font-playfair flex items-center">
                <FiSmile className="mr-2 text-rosegold" /> Reviews & Testimonials
              </h3>
              <div className="h-px bg-rosegold/20 w-32 mt-1.5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.length > 0 ? (
                reviews.map((rev, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-rosegold/20 bg-white dark:bg-darkcard/50 flex flex-col justify-between space-y-3 shadow-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-rosegold/10">
                      <span className="text-[10px] font-bold text-darktext dark:text-white font-playfair">{rev.clientName}</span>
                      <div className="flex items-center text-amber-500 space-x-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <FiStar key={i} className="fill-current w-3.5 h-3.5" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-darktext/75 dark:text-gray-405 italic leading-relaxed">
                      "{rev.text}"
                    </p>
                    {rev.verified && (
                      <div className="pt-1 flex justify-end">
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded-full border border-emerald-500/25">
                          Verified review
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-darktext/50 italic col-span-2">No testimonial reviews registered yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* LIGHTBOX PREVIEW */}
      <AnimatePresence>
        {activeLightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLightbox(null)}
              className="fixed inset-0 bg-[#1A1513]"
            />
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50"
            >
              <FiX className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] z-10"
            >
              <img
                src={activeLightbox.url}
                alt="Lightbox preview"
                className="rounded-2xl max-w-full max-h-[80vh] object-contain border border-white/10 shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE MEETING MODAL */}
      <AnimatePresence>
        {isMeetingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMeetingOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-darkcard w-full max-w-md p-6 sm:p-8 rounded-3xl border border-rosegold/25 dark:border-goldAccent/25 shadow-2xl relative z-10 overflow-hidden text-xs font-semibold text-darktext dark:text-gray-300"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold font-playfair text-darktext dark:text-white uppercase tracking-wider">
                    Schedule Call
                  </h3>
                  <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-1">Book consultation call with {planner.name?.name}</p>
                </div>
                <button onClick={() => setIsMeetingOpen(false)} className="p-1.5 rounded-full hover:bg-cream dark:hover:bg-darkbg text-rosegold dark:text-goldAccent">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Meeting Time</label>
                  <input
                    type="time"
                    required
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Meeting Platform</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Internal Video Call">Internal Video Call</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Agenda</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Brief agenda..."
                    value={meetingForm.agenda}
                    onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={scheduleMeetingMutation.isPending}
                  className="w-full py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow hover:opacity-95"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span>{scheduleMeetingMutation.isPending ? 'Scheduling Call...' : 'Book Call'}</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HIRE PLANNER MODAL */}
      <AnimatePresence>
        {isHireOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHireOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-darkcard w-full max-w-md p-6 sm:p-8 rounded-3xl border border-rosegold/25 dark:border-goldAccent/25 shadow-2xl relative z-10 overflow-hidden text-xs font-semibold text-darktext dark:text-gray-300"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold font-playfair text-darktext dark:text-white uppercase tracking-wider">
                    Hire Wedding Planner
                  </h3>
                  <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-1">Submit proposal to {planner.name?.name}</p>
                </div>
                <button onClick={() => setIsHireOpen(false)} className="p-1.5 rounded-full hover:bg-cream dark:hover:bg-darkbg text-rosegold dark:text-goldAccent">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleHireSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Theme / Style</label>
                  <select
                    value={hireForm.weddingType}
                    onChange={(e) => setHireForm({ ...hireForm, weddingType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  >
                    <option value="Royal Wedding">Royal Palace Wedding</option>
                    <option value="Destination Wedding">Destination Wedding</option>
                    <option value="Beach Wedding">Sunset Beach Wedding</option>
                    <option value="Luxury Wedding">Luxury Boutique Wedding</option>
                    <option value="Traditional Wedding">Traditional Heritage Wedding</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Planned Date</label>
                  <input
                    type="date"
                    required
                    value={hireForm.weddingDate}
                    onChange={(e) => setHireForm({ ...hireForm, weddingDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Destination City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur, Goa..."
                    value={hireForm.location}
                    onChange={(e) => setHireForm({ ...hireForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Budget (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7500000"
                    value={hireForm.budget}
                    onChange={(e) => setHireForm({ ...hireForm, budget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-[9px] tracking-widest text-darktext/60 dark:text-gray-400">Brief Requirements</label>
                  <textarea
                    rows="3"
                    placeholder="Mandate details..."
                    value={hireForm.requirements}
                    onChange={(e) => setHireForm({ ...hireForm, requirements: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream/10 dark:bg-black/20 border border-rosegold/20 dark:border-goldAccent/20 outline-none text-darktext dark:text-white resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={hirePlannerMutation.isPending}
                  className="w-full py-3 bg-rosegold dark:bg-goldAccent text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow hover:opacity-95"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span>{hirePlannerMutation.isPending ? 'Sending Proposal...' : 'Send Hiring Proposal'}</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlannerProfile;

