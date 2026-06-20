import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiMessageSquare, FiUser, FiCheckSquare, FiStar, FiMapPin, 
  FiArrowRight, FiActivity, FiBriefcase, FiFileText, FiBell, FiHeart, FiClock 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [clientTab, setClientTab] = useState('Overview');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // File upload state
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Contract');
  const [docSize, setDocSize] = useState(250000);

  // 1. Fetch assigned planner & wedding event details
  const { data: myPlannerResponse, isLoading: myPlannerLoading } = useQuery({
    queryKey: ['myPlanner'],
    queryFn: async () => {
      const res = await fetch('/api/client/my-planner');
      if (!res.ok) throw new Error('Failed to fetch assigned planner');
      return res.json();
    }
  });

  // 2. Fetch all active planners for recommendations
  const { data: plannersResponse, isLoading: plannersLoading } = useQuery({
    queryKey: ['planners'],
    queryFn: async () => {
      const res = await fetch('/api/planners');
      if (!res.ok) throw new Error('Failed to fetch planners');
      return res.json();
    }
  });

  // 3. Fetch documents
  const { data: docsResponse } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: async () => {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    }
  });

  // 4. Fetch notifications
  const { data: notifResponse } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    }
  });

  const hiredData = myPlannerResponse?.data || { hired: false };
  const plannersList = plannersResponse?.data || [];
  const documents = docsResponse?.data || [];
  const notifications = notifResponse?.data || [];

  // Countdown timer calculations
  const weddingDate = hiredData.weddingEvent?.date 
    ? new Date(hiredData.weddingEvent.date) 
    : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // fallback to 6 months from now
    
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = weddingDate.getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((difference / 1000 / 60) % 60);
      setTimeLeft({ days, hours, mins });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [hiredData.weddingEvent?.date]);

  // Mutations
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to toggle task');
      return res.json();
    },
    onSuccess: () => {
      toast.success("Task status updated");
      queryClient.invalidateQueries({ queryKey: ['myPlanner'] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (title) => {
      const eventId = hiredData.weddingEvent?._id;
      const res = await fetch(`/api/events/${eventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: 'Added by Client' })
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      toast.success("Checklist task added");
      setNewTaskTitle('');
      queryClient.invalidateQueries({ queryKey: ['myPlanner'] });
    }
  });

  const uploadDocMutation = useMutation({
    mutationFn: async (docData) => {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: () => {
      toast.success("Document metadata registered successfully!");
      setDocName('');
      queryClient.invalidateQueries({ queryKey: ['myDocuments'] });
    }
  });

  const markNotificationMutation = useMutation({
    mutationFn: async (notifId) => {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    }
  });

  const handleTaskToggle = (taskId, currentlyCompleted) => {
    toggleTaskMutation.mutate({
      taskId,
      status: currentlyCompleted ? 'Pending' : 'Completed'
    });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate(newTaskTitle);
  };

  const handleDocSubmit = (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    uploadDocMutation.mutate({
      name: docName,
      type: docType,
      size: docSize,
      eventId: hiredData.weddingEvent?._id
    });
  };

  // Filter planners
  const topRated = [...plannersList].sort((a, b) => b.ratings - a.ratings).slice(0, 4);
  const recommended = [...plannersList].filter(p => p.ratings >= 4.9).slice(0, 4);
  const recentlyActive = [...plannersList].slice(0, 3);
  const featured = [...plannersList].filter(p => p.exprience && parseInt(p.exprience) >= 8).slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  if (myPlannerLoading || plannersLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center bg-ivory dark:bg-darkbg">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-rosegold/20 border-t-rosegold dark:border-goldAccent/20 dark:border-t-goldAccent animate-spin" />
          <p className="font-playfair text-xs tracking-widest text-rosegold dark:text-goldAccent uppercase animate-pulse">Curating luxury choices...</p>
        </div>
      </div>
    );
  }

  // Inspiration Gallery
  const inspirations = [
    { url: "https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?q=80&w=400", title: "Royal Banquets" },
    { url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=400", title: "Luxury Details" },
    { url: "https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=400", title: "Floral Curation" },
    { url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=400", title: "Grand Venues" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-16 font-roboto"
    >
      {/* Wedding Cover Banner / Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/35 dark:bg-darkcard p-6 md:p-8 shadow-md"
      >
        {/* Floral background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-10 dark:opacity-5 pointer-events-none select-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-rosegold dark:text-goldAccent w-full h-full">
            <path d="M50 0 C40 20 20 40 0 50 C20 60 40 80 50 100 C60 80 80 60 100 50 C80 40 60 20 50 0 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          
          {/* Left: Arch-shaped Bride & Groom Image */}
          <div className="w-full lg:w-1/3 flex justify-center">
            <div className="arch-card w-[220px] h-[300px] overflow-hidden border-2 border-rosegold/40 dark:border-goldAccent/35 shadow-lg relative group bg-cream">
              <img 
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600" 
                alt="Bride and Groom" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 inset-x-0 text-center">
                <span className="font-playfair text-white text-lg tracking-widest uppercase">The Forever Bond</span>
              </div>
            </div>
          </div>

          {/* Right: Wedding cover banner details */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-rosegold dark:text-goldAccent uppercase block mb-1">
                Luxury Wedding Registry
              </span>
              <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-darktext dark:text-white tracking-wide leading-tight">
                Celebrate the Union of <span className="text-rosegold dark:text-goldAccent">{user?.name}</span>
              </h2>
              <p className="font-playfair italic text-xs md:text-sm text-darktext/70 dark:text-gray-400 mt-2.5 max-w-xl font-light">
                "Once in a while, right in the middle of an ordinary life, love gives us a fairy tale."
              </p>
            </div>

            {/* Countdown to wedding */}
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto lg:mx-0 p-3 bg-white/50 dark:bg-black/20 rounded-2xl border border-rosegold/10 dark:border-goldAccent/10">
              <div className="text-center p-1">
                <span className="block text-2xl font-bold font-playfair text-rosegold dark:text-goldAccent">{timeLeft.days}</span>
                <span className="text-[9px] uppercase tracking-wider text-darktext/60 dark:text-gray-400">Days</span>
              </div>
              <div className="text-center p-1 border-x border-rosegold/10 dark:border-goldAccent/10">
                <span className="block text-2xl font-bold font-playfair text-rosegold dark:text-goldAccent">{timeLeft.hours}</span>
                <span className="text-[9px] uppercase tracking-wider text-darktext/60 dark:text-gray-400">Hours</span>
              </div>
              <div className="text-center p-1">
                <span className="block text-2xl font-bold font-playfair text-rosegold dark:text-goldAccent">{timeLeft.mins}</span>
                <span className="text-[9px] uppercase tracking-wider text-darktext/60 dark:text-gray-400">Mins</span>
              </div>
            </div>

            {/* Wedding progress & planner status */}
            <div className="space-y-2 max-w-lg">
              <div className="flex justify-between items-center text-xs font-semibold text-darktext/80 dark:text-gray-400">
                <span className="font-playfair tracking-wide">Wedding Planning Progress</span>
                <span className="text-rosegold dark:text-goldAccent">{hiredData.weddingEvent?.progress || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-cream dark:bg-darkcard border border-rosegold/15 dark:border-goldAccent/15 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rosegold to-goldAccent transition-all duration-750"
                  style={{ width: `${hiredData.weddingEvent?.progress || 0}%` }}
                />
              </div>
              <p className="text-[11px] text-darktext/65 dark:text-gray-405 font-light">
                Planner status: <span className="font-semibold text-rosegold dark:text-goldAccent">{hiredData.hired ? `${hiredData.planner?.companyName} is curating your event` : "No Planner hired yet"}</span>
              </p>
            </div>
            
            {!hiredData.hired && (
              <Link
                to="/client/planners"
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-rosegold dark:bg-goldAccent hover:bg-rosegold/90 dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow-sm hover:shadow transition-all duration-300 hover:scale-[1.02]"
              >
                <span>Hire Premium Planner</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Wedding Workspace Section */}
      <motion.section variants={itemVariants} className="space-y-6">
        {hiredData.hired ? (
          <div className="space-y-6">
            
            {/* Elegant Tab Selectors */}
            <div className="flex flex-wrap gap-2 border-b border-rosegold/20 dark:border-goldAccent/15 pb-2">
              {['Overview', 'Timeline & Progress', 'Checklist Tasks', 'Documents & Files', 'Notifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setClientTab(tab)}
                  className={`px-4 py-2 rounded-t-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 border-t border-x border-transparent -mb-2 ${
                    clientTab === tab 
                      ? 'bg-cream/45 dark:bg-darkcard text-rosegold dark:text-goldAccent border-rosegold/25 dark:border-goldAccent/25 font-playfair' 
                      : 'text-darktext/70 dark:text-gray-400 hover:text-rosegold dark:hover:text-goldAccent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={clientTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="luxury-card rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 p-6 shadow-sm"
              >
                {/* OVERVIEW TAB */}
                {clientTab === 'Overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Assigned Planner */}
                    <div className="lg:col-span-5 flex flex-col justify-between relative group">
                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent bg-rosegold/10 dark:bg-goldAccent/10 px-3 py-1 rounded border border-rosegold/20 dark:border-goldAccent/20">
                            Curating Coordinator
                          </span>
                          <div className="flex items-center space-x-1 text-goldAccent font-bold text-xs">
                            <FiStar className="fill-current w-3.5 h-3.5" />
                            <span>{hiredData.planner?.ratings?.toFixed(1) || '5.0'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-rosegold/30 dark:border-goldAccent/30">
                            <img
                              src={hiredData.planner?.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"}
                              alt="Planner"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-base font-bold font-playfair text-darktext dark:text-white">
                              {hiredData.planner?.name?.name || "Premium Coordinator"}
                            </h3>
                            <p className="text-xs text-rosegold dark:text-goldAccent font-semibold">{hiredData.planner?.companyName}</p>
                            <p className="text-[10px] text-darktext/60 dark:text-gray-400 mt-1 flex items-center">
                              <FiMapPin className="mr-1 w-3 h-3 text-rosegold dark:text-goldAccent" />
                              {hiredData.planner?.city} • {hiredData.planner?.exprience} Exp
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-darktext/75 dark:text-gray-400 italic leading-relaxed">
                          "{hiredData.planner?.bio || "Committed to turning your luxury wedding dreams into majestic real-life celebrations."}"
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-3 border-t border-rosegold/10 dark:border-goldAccent/10 pt-4 mt-6">
                        <button
                          onClick={() => navigate(`/client/chat/${hiredData.planner?.name?._id || hiredData.planner?.userId?._id}`)}
                          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-cream/30 hover:bg-rosegold/10 dark:bg-darkbg/30 dark:hover:bg-goldAccent/10 text-darktext dark:text-gray-305 transition-all border border-rosegold/10 dark:border-goldAccent/10 hover:border-rosegold/30 dark:hover:border-goldAccent/30"
                        >
                          <FiMessageSquare className="w-4 h-4 mb-1 text-rosegold dark:text-goldAccent" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Quick Chat</span>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/client/planners/${hiredData.planner?._id}?book=true`)}
                          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-cream/30 hover:bg-rosegold/10 dark:bg-darkbg/30 dark:hover:bg-goldAccent/10 text-darktext dark:text-gray-305 transition-all border border-rosegold/10 dark:border-goldAccent/10 hover:border-rosegold/30 dark:hover:border-goldAccent/30"
                        >
                          <FiCalendar className="w-4 h-4 mb-1 text-rosegold dark:text-goldAccent" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Meeting</span>
                        </button>

                        <button
                          onClick={() => navigate(`/client/planners/${hiredData.planner?._id}`)}
                          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-cream/30 hover:bg-rosegold/10 dark:bg-darkbg/30 dark:hover:bg-goldAccent/10 text-darktext dark:text-gray-305 transition-all border border-rosegold/10 dark:border-goldAccent/10 hover:border-rosegold/30 dark:hover:border-goldAccent/30"
                        >
                          <FiUser className="w-4 h-4 mb-1 text-rosegold dark:text-goldAccent" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Profile</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick list of tasks & meetings */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent mb-3 flex items-center">
                          <FiCheckSquare className="mr-2 text-rosegold dark:text-goldAccent" />
                          Checklist Tasks
                        </h4>
                        <div className="space-y-3">
                          {hiredData.currentTasks?.slice(0, 3).map((task) => (
                            <div key={task.id} className="flex items-start space-x-2 text-xs">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleTaskToggle(task.id, task.done)}
                                className="rounded text-rosegold focus:ring-rosegold dark:text-goldAccent dark:focus:ring-goldAccent w-3.5 h-3.5 mt-0.5 cursor-pointer bg-transparent border-rosegold/30 dark:border-goldAccent/30"
                              />
                              <span className={`leading-tight font-medium ${task.done ? 'line-through text-darktext/40 dark:text-gray-500' : 'text-darktext dark:text-gray-300'}`}>
                                {task.text}
                              </span>
                            </div>
                          ))}
                          {(!hiredData.currentTasks || hiredData.currentTasks.length === 0) && (
                            <p className="text-xs text-darktext/50 py-2">No tasks created yet.</p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent mb-3 flex items-center">
                            <FiCalendar className="mr-2 text-rosegold dark:text-goldAccent" />
                            Consultations
                          </h4>
                          <div className="space-y-2.5">
                            {hiredData.upcomingMeetings && hiredData.upcomingMeetings.length > 0 ? (
                              hiredData.upcomingMeetings.slice(0, 2).map((meet) => (
                                <div key={meet._id} className="p-2.5 rounded bg-white/60 dark:bg-black/30 border border-rosegold/10 dark:border-goldAccent/10">
                                  <p className="text-xs font-bold text-darktext dark:text-white truncate font-playfair">{meet.agenda}</p>
                                  <span className="text-[9px] text-darktext/60 dark:text-gray-400 mt-1 block">
                                    {new Date(meet.date).toLocaleDateString()} at {meet.time} ({meet.meetingType})
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-darktext/50 py-2">No meetings booked yet.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TIMELINE & PROGRESS TAB */}
                {clientTab === 'Timeline & Progress' && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 dark:border-goldAccent/10 font-playfair">Wedding Timeline</h3>
                    
                    <div className="relative border-l border-rosegold/20 dark:border-goldAccent/15 ml-4 pl-6 space-y-6">
                      {hiredData.weddingEvent?.timeline?.map((item, idx) => (
                        <div key={item._id || idx} className="relative">
                          <div className={`absolute left-[-31px] top-1 w-3.5 h-3.5 rounded-full border bg-white dark:bg-darkbg ${
                            item.status === 'Completed' ? 'border-rosegold bg-rosegold dark:border-goldAccent dark:bg-goldAccent' : 'border-rosegold/30 dark:border-goldAccent/30'
                          }`} />
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-darktext dark:text-white font-playfair">{item.title}</h4>
                              <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                item.status === 'Completed' ? 'bg-rosegold/15 text-rosegold dark:bg-goldAccent/10 dark:text-goldAccent' : 'bg-cream/50 text-darktext/40 dark:bg-black/30 dark:text-gray-500'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-darktext/75 dark:text-gray-400 mt-1 font-light">{item.description}</p>
                            <span className="text-[9px] text-rosegold dark:text-goldAccent/80 font-semibold block mt-1">
                              Target Date: {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {(!hiredData.weddingEvent?.timeline || hiredData.weddingEvent.timeline.length === 0) && (
                        <p className="text-xs text-darktext/50">Timeline not configured by planner yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* CHECKLIST TASKS TAB */}
                {clientTab === 'Checklist Tasks' && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 dark:border-goldAccent/10 font-playfair">Wedding Checklist</h3>
                    
                    <form onSubmit={handleAddTask} className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a custom wedding task..."
                        className="flex-1 bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded px-3 py-2 text-xs text-darktext dark:text-white placeholder-darktext/35 dark:placeholder-gray-600 focus:outline-none focus:border-rosegold dark:focus:border-goldAccent"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded"
                      >
                        Add Task
                      </button>
                    </form>

                    <div className="space-y-2">
                      {hiredData.currentTasks?.map((task) => (
                        <div 
                          key={task.id} 
                          onClick={() => handleTaskToggle(task.id, task.done)}
                          className="flex items-center space-x-3 p-3 bg-cream/20 dark:bg-darkbg/35 border border-rosegold/10 dark:border-goldAccent/10 rounded-xl cursor-pointer hover:bg-rosegold/5 transition-all text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={task.done}
                            readOnly
                            className="rounded text-rosegold focus:ring-rosegold dark:text-goldAccent dark:focus:ring-goldAccent w-3.5 h-3.5 pointer-events-none bg-transparent border-rosegold/30 dark:border-goldAccent/30"
                          />
                          <span className={`leading-tight font-medium ${task.done ? 'line-through text-darktext/40 dark:text-gray-500' : 'text-darktext dark:text-gray-205'}`}>
                            {task.text}
                          </span>
                        </div>
                      ))}
                      {(!hiredData.currentTasks || hiredData.currentTasks.length === 0) && (
                        <p className="text-xs text-darktext/50 text-center py-4">No tasks listed.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* DOCUMENTS TAB */}
                {clientTab === 'Documents & Files' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Upload panel */}
                    <div className="lg:col-span-5 p-4 bg-cream/20 dark:bg-darkbg/20 border border-rosegold/15 dark:border-goldAccent/10 rounded-2xl space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent">Register File</h4>
                      <form onSubmit={handleDocSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">File Name</label>
                          <input
                            type="text"
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                            required
                            placeholder="e.g. Catering Menu Draft"
                            className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-darktext/60 dark:text-gray-400 uppercase tracking-widest block font-bold">Type</label>
                          <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            className="w-full bg-cream/10 dark:bg-black/25 border border-rosegold/20 dark:border-goldAccent/20 rounded p-2 text-xs text-darktext dark:text-white outline-none focus:border-rosegold dark:focus:border-goldAccent"
                          >
                            <option value="Contract">Contract Agreement</option>
                            <option value="Invoice">Receipt / Invoice</option>
                            <option value="Moodboard">Inspirations / Moodboard</option>
                            <option value="Guestlist">Guest List</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow"
                        >
                          Register Document
                        </button>
                      </form>
                    </div>

                    {/* Files list */}
                    <div className="lg:col-span-7 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent">Project Vault</h4>
                      <div className="space-y-2.5">
                        {documents.map((doc) => (
                          <div key={doc._id} className="p-3 bg-cream/20 dark:bg-black/20 border border-rosegold/10 dark:border-goldAccent/10 rounded-xl flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-rosegold/10 text-rosegold dark:bg-goldAccent/15 dark:text-goldAccent rounded-lg">
                                <FiFileText className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-xs text-darktext dark:text-white font-playfair">{doc.name}</p>
                                <span className="text-[9px] text-darktext/50 uppercase tracking-wider font-semibold">{doc.type} • {(doc.size / 1000).toFixed(0)} KB</span>
                              </div>
                            </div>
                            <span className="text-[9.5px] text-darktext/50">{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                        {documents.length === 0 && (
                          <p className="text-xs text-darktext/50 py-4 text-center">Your project vault is currently empty.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {clientTab === 'Notifications' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rosegold dark:text-goldAccent pb-2 border-b border-rosegold/10 dark:border-goldAccent/10 font-playfair">Alerts & Logs</h3>
                    <div className="space-y-2 text-xs">
                      {notifications.map((n) => (
                        <div 
                          key={n._id} 
                          onClick={() => { if(!n.read) markNotificationMutation.mutate(n._id) }}
                          className={`p-3 border rounded-xl flex justify-between items-center transition-all ${
                            n.read 
                              ? 'bg-cream/10 dark:bg-black/10 border-rosegold/10 text-darktext/60 dark:text-gray-500' 
                              : 'bg-rosegold/10 dark:bg-goldAccent/10 border-rosegold/20 dark:border-goldAccent/25 text-darktext dark:text-white font-semibold cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <FiBell className={`w-4 h-4 flex-shrink-0 ${n.read ? 'text-rosegold/40' : 'text-rosegold dark:text-goldAccent animate-bounce'}`} />
                            <p className="leading-tight">{n.message}</p>
                          </div>
                          <span className="text-[8.5px] text-darktext/50 ml-4 flex-shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-xs text-darktext/50 py-4 text-center">No alerts in your history yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /* Find Planner Invitation Banner */
          <div className="relative p-8 rounded-3xl overflow-hidden luxury-card border border-rosegold/20 dark:border-goldAccent/20 shadow-md text-center max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-rosegold/10 dark:bg-goldAccent/10 flex items-center justify-center text-rosegold dark:text-goldAccent mb-4 border border-rosegold/20 dark:border-goldAccent/20">
              <FiHeart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-playfair text-darktext dark:text-white mb-2">Find Your Perfect Wedding Curator</h3>
            <p className="text-xs text-darktext/75 dark:text-gray-400 max-w-md leading-relaxed mb-6">
              Connect with vetted wedding specialists, view luxury portfolios of past ceremonies, and build your dream celebration plan.
            </p>
            <button
              onClick={() => navigate('/client/planners')}
              className="px-6 py-2.5 bg-rosegold dark:bg-goldAccent hover:bg-rosegold/90 dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest rounded shadow-sm hover:scale-[1.02] transition-all"
            >
              Browse Planner Registry
            </button>
          </div>
        )}
      </motion.section>

      {/* Wedding Inspiration Masonry Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="border-b border-rosegold/25 dark:border-goldAccent/25 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-darktext dark:text-goldAccent font-playfair">
            Wedding Mood Board & Inspiration
          </h3>
          <p className="text-[10px] text-darktext/60 dark:text-gray-400">Pinterest-style luxury wedding design concepts</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {inspirations.map((item, idx) => (
            <div key={idx} className="relative group overflow-hidden rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 h-[160px] shadow-sm bg-cream">
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-playfair font-bold text-xs uppercase tracking-wider">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommended Sliders */}
      <div className="space-y-12">
        <PlannerSliderSection title="Recommended Planners" subtitle="Top matching curators based on rating & style" planners={recommended} navigate={navigate} />
        <PlannerSliderSection title="Top Rated Planners" subtitle="Highly recommended and verified coordinators" planners={topRated} navigate={navigate} />
        <PlannerSliderSection title="Recently Active Planners" subtitle="Ready to take on new custom bookings immediately" planners={recentlyActive} navigate={navigate} />
        <PlannerSliderSection title="Featured Wedding Experts" subtitle="Senior designers with 8+ years of production experience" planners={featured} navigate={navigate} />
      </div>
    </motion.div>
  );
};

const PlannerSliderSection = ({ title, subtitle, planners, navigate }) => {
  if (planners.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="space-y-4 font-roboto"
    >
      <div className="flex justify-between items-end border-b border-rosegold/20 dark:border-goldAccent/15 pb-2">
        <div>
          <h3 className="text-sm font-bold text-darktext dark:text-goldAccent font-playfair uppercase tracking-wider flex items-center">
            <span className="w-2 h-2 rounded-full bg-rosegold dark:bg-goldAccent mr-2" />
            {title}
          </h3>
          <p className="text-[10px] text-darktext/60 dark:text-gray-400">{subtitle}</p>
        </div>
        <Link to="/client/planners" className="text-xs font-semibold text-rosegold dark:text-goldAccent hover:underline flex items-center space-x-1">
          <span>View All</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-none scroll-smooth">
        {planners.map((planner) => (
          <div
            key={planner._id}
            onClick={() => navigate(`/client/planners/${planner._id}`)}
            className="flex-shrink-0 w-[270px] luxury-card border border-rosegold/20 dark:border-goldAccent/15 rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:border-rosegold/40 dark:hover:border-goldAccent/40 hover:scale-[1.01] transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div className="relative h-[150px] w-full overflow-hidden">
              <img 
                src={planner.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"} 
                alt="wedding cover" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute bottom-3 left-4 flex items-center space-x-3">
                <img 
                  src={planner.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"} 
                  alt="planner" 
                  className="w-9 h-9 rounded-xl object-cover border border-white/30" 
                />
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[150px] font-playfair">{planner.name?.name}</h4>
                  <p className="text-[9px] text-gray-300 truncate max-w-[150px] font-light">{planner.companyName}</p>
                </div>
              </div>

              <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                planner.availabilityStatus === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {planner.availabilityStatus}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-darktext/60 dark:text-gray-400 font-semibold">{planner.city}</span>
                  <div className="flex items-center space-x-1 text-goldAccent font-bold">
                    <FiStar className="fill-current w-3.5 h-3.5" />
                    <span>{planner.ratings?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-darktext dark:text-gray-205 font-medium truncate font-playfair">{planner.specialiazation}</p>
                <p className="text-[10px] text-darktext/70 dark:text-gray-400 line-clamp-2 leading-relaxed font-light">{planner.bio}</p>
              </div>
              <div className="flex justify-between items-center border-t border-rosegold/10 dark:border-goldAccent/10 pt-3 text-[10px] font-bold text-rosegold dark:text-goldAccent/80">
                <span className="flex items-center">
                  <FiActivity className="mr-1 text-rosegold dark:text-goldAccent" />
                  {planner.assignedEvents} Weddings
                </span>
                <span>{planner.exprience} Exp</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ClientDashboard;
