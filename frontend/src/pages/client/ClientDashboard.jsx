import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCalendar, FiMessageSquare, FiUser, FiCheckSquare, FiStar, FiMapPin, FiArrowRight, FiActivity, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch assigned planner
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

  const hiredData = myPlannerResponse?.data || { hired: false };
  const plannersList = plannersResponse?.data || [];

  // Filter planners into different segments for luxury sliders
  const topRated = [...plannersList].sort((a, b) => b.ratings - a.ratings).slice(0, 4);
  const recommended = [...plannersList].filter(p => p.ratings >= 4.9).slice(0, 4);
  const recentlyActive = [...plannersList].slice(0, 3);
  const featured = [...plannersList].filter(p => p.exprience && parseInt(p.exprience) >= 8).slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  if (myPlannerLoading || plannersLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Curating luxury choices...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-16"
    >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#020617] p-8 text-white border border-slate-800/80 shadow-xl"
      >
        <div className="absolute top-[-40%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">{user?.name}</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-lg font-light leading-relaxed">
              Every detail is a memory in the making. Manage your hiring, schedule meetings, and trace checklists for your grand day.
            </p>
          </div>
          {!hiredData.hired && (
            <Link
              to="/client/planners"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all self-start md:self-auto text-sm"
            >
              <span>Explore Wedding Planners</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </motion.div>

      {/* 1. Hired Planner Deck vs Banner invite */}
      <motion.section variants={itemVariants}>
        {hiredData.hired ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Planner summary */}
            <div className="lg:col-span-5 glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
              {/* Floral background decoration trace */}
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-accent/5 blur-xl pointer-events-none group-hover:bg-accent/10 transition-colors" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                    Your Assigned Planner
                  </span>
                  <div className="flex items-center space-x-1 text-amber-500 font-bold text-sm">
                    <FiStar className="fill-current w-4 h-4" />
                    <span>{hiredData.planner?.ratings?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={hiredData.planner?.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"}
                    alt={hiredData.planner?.name?.name || "Planner"}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-accent/25"
                  />
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {hiredData.planner?.name?.name || "Luxury Planner"}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{hiredData.planner?.companyName}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center">
                      <FiMapPin className="mr-1 w-3 h-3 text-accent" />
                      {hiredData.planner?.city} • {hiredData.planner?.exprience} Exp
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-650 dark:text-slate-400 italic line-clamp-3 leading-relaxed mb-6">
                  "{hiredData.planner?.bio}"
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <button
                  onClick={() => navigate(`/client/chat/${hiredData.planner?.name?._id || hiredData.planner?.userId?._id}`)}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-accent/10 dark:bg-slate-900/50 dark:hover:bg-accent/10 hover:text-accent text-slate-600 dark:text-slate-300 transition-all border border-transparent hover:border-accent/20"
                >
                  <FiMessageSquare className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] font-bold">Quick Chat</span>
                </button>
                
                <button
                  onClick={() => navigate(`/client/planners/${hiredData.planner?._id}?book=true`)}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-accent/10 dark:bg-slate-900/50 dark:hover:bg-accent/10 hover:text-accent text-slate-600 dark:text-slate-300 transition-all border border-transparent hover:border-accent/20"
                >
                  <FiCalendar className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] font-bold">Meeting</span>
                </button>

                <button
                  onClick={() => navigate(`/client/planners/${hiredData.planner?._id}`)}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-accent/10 dark:bg-slate-900/50 dark:hover:bg-accent/10 hover:text-accent text-slate-600 dark:text-slate-300 transition-all border border-transparent hover:border-accent/20"
                >
                  <FiUser className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] font-bold">Profile</span>
                </button>
              </div>

            </div>

            {/* Checklist tasks & Meetings */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Task Checklist */}
              <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase flex items-center">
                      <FiCheckSquare className="mr-2 text-accent" />
                      Current Tasks
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                      Checklist
                    </span>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {hiredData.currentTasks?.map((task) => (
                      <div key={task.id} className="flex items-start space-x-3 text-xs">
                        <input
                          type="checkbox"
                          checked={task.done}
                          readOnly
                          className="rounded text-accent focus:ring-accent w-4 h-4 bg-slate-150 border-slate-300 pointer-events-none mt-0.5"
                        />
                        <span className={`leading-tight font-medium ${task.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-350'}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-6 text-center">
                  <span className="text-[10px] text-slate-500">
                    Hired planner actively updates your checklist
                  </span>
                </div>
              </div>

              {/* Upcoming Meetings */}
              <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase flex items-center">
                      <FiCalendar className="mr-2 text-accent" />
                      Upcoming Meetings
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {hiredData.upcomingMeetings && hiredData.upcomingMeetings.length > 0 ? (
                      hiredData.upcomingMeetings.map((meet) => (
                        <div key={meet._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{meet.agenda}</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                            <span>{new Date(meet.date).toLocaleDateString()} at {meet.time}</span>
                            <span className="font-semibold text-accent">{meet.meetingType}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400">
                        <p className="text-xs">No upcoming video calls.</p>
                        <p className="text-[10px] text-slate-500 mt-1">Book a new meeting request above.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-6">
                  <button 
                    onClick={() => navigate(`/client/planners/${hiredData.planner?._id}?book=true`)}
                    className="w-full py-2 bg-slate-100 hover:bg-accent hover:text-white dark:bg-slate-900/50 dark:hover:bg-accent text-[11px] font-bold rounded-xl transition-all"
                  >
                    Schedule New Video Meeting
                  </button>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* Find Planner Invitation Banner */
          <div className="relative p-8 rounded-3xl overflow-hidden glass border border-slate-200/50 dark:border-slate-850 shadow-md text-center max-w-3xl mx-auto flex flex-col items-center">
            {/* Background floral arches decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,#0EA5E9_0%,transparent_70%)]" />
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-accent mb-4 shadow-inner">
              <FiBriefcase className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Find Your Perfect Wedding Planner</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-6">
              Connect with vetted wedding specialists, view Pinterest-style galleries of past ceremonies, book consultation calls, and submit custom hiring briefs.
            </p>
            <button
              onClick={() => navigate('/client/planners')}
              className="px-8 py-3 bg-gradient-to-r from-accent to-primary text-white text-xs font-bold rounded-2xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Browse Planner Registry
            </button>
          </div>
        )}
      </motion.section>

      {/* 2. Luxury Sliders */}
      <div className="space-y-12">
        
        {/* Recommended Planners Slider */}
        <PlannerSliderSection 
          title="Recommended Planners" 
          subtitle="Top matching curators based on rating & style"
          planners={recommended}
          navigate={navigate}
        />

        {/* Top Rated Planners Slider */}
        <PlannerSliderSection 
          title="Top Rated Planners" 
          subtitle="Highly recommended and verified coordinators"
          planners={topRated}
          navigate={navigate}
        />

        {/* Recently Active Planners */}
        <PlannerSliderSection 
          title="Recently Active Planners" 
          subtitle="Ready to take on new custom bookings immediately"
          planners={recentlyActive}
          navigate={navigate}
        />

        {/* Featured Wedding Experts */}
        <PlannerSliderSection 
          title="Featured Wedding Experts" 
          subtitle="Senior designers with 8+ years of production experience"
          planners={featured}
          navigate={navigate}
        />

      </div>

    </motion.div>
  );
};

// Sub-component for Horizontally Scrollable Planner Card Slider
const PlannerSliderSection = ({ title, subtitle, planners, navigate }) => {
  if (planners.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="space-y-4"
    >
      <div className="flex justify-between items-end border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-accent mr-2.5" />
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
        </div>
        <Link 
          to="/client/planners" 
          className="text-xs font-semibold text-accent hover:text-primary transition-colors flex items-center space-x-1"
        >
          <span>View All</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Scroll Deck */}
      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-350 pt-2 -mx-2 px-2 scroll-smooth">
        {planners.map((planner) => (
          <div
            key={planner._id}
            onClick={() => navigate(`/client/planners/${planner._id}`)}
            className="flex-shrink-0 w-[270px] glass-card border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg hover:border-accent/35 transition-all duration-300 relative group flex flex-col justify-between"
          >
            {/* Top Image & Overlay */}
            <div className="relative h-[150px] w-full overflow-hidden">
              <img
                src={planner.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
                alt="wedding cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
              
              {/* Profile Overlay */}
              <div className="absolute bottom-3 left-4 flex items-center space-x-3">
                <img
                  src={planner.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256"}
                  alt={planner.name?.name || "planner"}
                  className="w-10 h-10 rounded-xl object-cover border border-white/30"
                />
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{planner.name?.name}</h4>
                  <p className="text-[9px] text-slate-300 truncate max-w-[150px]">{planner.companyName}</p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                planner.availabilityStatus === 'Available' 
                  ? 'bg-emerald-500/80 text-white' 
                  : 'bg-amber-500/80 text-white'
              }`}>
                {planner.availabilityStatus}
              </span>
            </div>

            {/* Bottom details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-semibold">{planner.city}</span>
                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                    <FiStar className="fill-current w-3.5 h-3.5" />
                    <span>{planner.ratings?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">
                  {planner.specialiazation}
                </p>
                
                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                  {planner.bio}
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex justify-between items-center border-t border-slate-200/40 dark:border-slate-800/40 pt-3 text-[10px] font-bold text-slate-650 dark:text-slate-350">
                <span className="flex items-center">
                  <FiActivity className="mr-1 text-accent" />
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
