import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { FiSend, FiCamera, FiPaperclip, FiClock, FiCheck, FiCheckCircle, FiChevronLeft, FiPhone, FiVideo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const DirectChat = () => {
  const { plannerId } = useParams(); // This holds the recipient user ID
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Helper to resolve display name based on profile type
  const getDisplayName = (convItem) => {
    if (!convItem) return '';
    return convItem.profile?.businessName || convItem.profile?.companyName || convItem.user?.name || '';
  };

  // Chat state
  const [typedMessage, setTypedMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // 1. Fetch active conversations (unique users we have chatted with)
  const { data: conversationsResponse, isLoading: listLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/chat/conversations');
      if (!res.ok) throw new Error('Failed to load conversations');
      return res.json();
    }
  });

  const conversations = conversationsResponse?.data || [];

  // 2. Fetch details of the recipient if not already in the conversations list
  const { data: chatUserResponse } = useQuery({
    queryKey: ['chatUser', plannerId],
    queryFn: async () => {
      if (!plannerId || plannerId === 'list') return null;
      const res = await fetch(`/api/auth/user/${plannerId}`);
      if (!res.ok) return null;
      const result = await res.json();
      return result.data;
    },
    enabled: !!plannerId && plannerId !== 'list' && !conversations.some(c => c.user._id === plannerId)
  });

  // Construct display conversations list (prepend new contact if needed)
  const displayConversations = [...conversations];
  if (chatUserResponse && !conversations.some(c => c.user._id === plannerId)) {
    displayConversations.unshift({
      user: chatUserResponse.user,
      profile: chatUserResponse.profile,
      lastMessage: "No messages yet",
      lastMessageTime: new Date(),
      unreadCount: 0
    });
  }

  // Active conversation partner details
  const activeConversation = displayConversations.find(c => c.user._id === plannerId);
  const recipientUser = activeConversation?.user;
  const recipientProfile = activeConversation?.profile;

  // 3. Fetch messages for the active conversation
  const { data: messagesResponse, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', plannerId],
    queryFn: async () => {
      if (!plannerId || plannerId === 'list') return [];
      const res = await fetch(`/api/chat/${plannerId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const result = await res.json();
      return result.data || [];
    },
    enabled: !!plannerId && plannerId !== 'list'
  });

  const messages = messagesResponse || [];

  // Setup Socket.io Real-Time connection
  useEffect(() => {
    if (!user?._id) return;

    // Connect to backend server socket with JWT authentication token
    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_BACKEND_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    // Register active user session and rejoin rooms on connection (including automatic reconnection)
    socket.on("connect", () => {
      console.log("Socket connected, registering user session and rejoining active chat room");
      socket.emit("joinUser", user._id);
      
      if (plannerId && plannerId !== 'list') {
        const conversationId = [user._id, plannerId].sort().join("_");
        socket.emit("joinConversation", conversationId);
        socket.emit("messageSeen", { conversationId, receiverId: user._id });
      }
    });

    // Handle connection authentication errors to prevent infinite reconnect loops
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      if (err.message.includes("Authentication error")) {
        socket.disconnect();
      }
    });

    // Listen for the online users list
    socket.on("onlineUsers", (usersList) => {
      setOnlineUsers(new Set(usersList));
    });

    // Listen for incoming messages
    socket.on("receiveMessage", (newMsg) => {
      const currentConvId = [user._id, plannerId].sort().join("_");
      
      if (newMsg.conversationId === currentConvId) {
        queryClient.setQueryData(['messages', plannerId], (old) => {
          const list = old || [];
          if (list.some(m => m._id === newMsg._id)) return list;
          return [...list, newMsg];
        });

        // Mark message as seen since the conversation is currently open
        if (newMsg.sender !== user._id) {
          socket.emit("messageSeen", { conversationId: currentConvId, messageId: newMsg._id, receiverId: user._id });
        }
      }
      
      // Invalidate conversation list to update last message preview and unread counts
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    // Listen for partner typing indicator status
    socket.on("typing", ({ senderId }) => {
      if (senderId === plannerId) {
        setPartnerTyping(true);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === plannerId) {
        setPartnerTyping(false);
      }
    });

    // Listen for read receipts (messageSeen)
    socket.on("messageSeen", ({ conversationId, messageId, receiverId }) => {
      const currentConvId = [user._id, plannerId].sort().join("_");
      if (conversationId === currentConvId) {
        queryClient.setQueryData(['messages', plannerId], (old) => {
          const list = old || [];
          return list.map(msg => {
            if (messageId) {
              if (msg._id === messageId) return { ...msg, read: true };
            } else {
              if (msg.sender !== receiverId) return { ...msg, read: true };
            }
            return msg;
          });
        });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageSeen");
      socket.disconnect();
    };
  }, [user?._id, plannerId, queryClient]);

  // Handle room joining / leaving and read status on partner (plannerId) change
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user?._id || !plannerId || plannerId === 'list') return;

    const conversationId = [user._id, plannerId].sort().join("_");

    // Join conversation room
    socket.emit("joinConversation", conversationId);

    // Mark existing messages as read
    socket.emit("messageSeen", { conversationId, receiverId: user._id });

    return () => {
      // Leave previous conversation room
      socket.emit("leaveConversation", conversationId);
    };
  }, [plannerId, user?._id, socketRef.current]);

  // Broadcast typing/stopTyping indicators with a 2-second debounce
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !plannerId || plannerId === 'list') return;

    const conversationId = [user._id, plannerId].sort().join("_");

    if (typedMessage.trim().length > 0) {
      if (!typing) {
        setTyping(true);
        socket.emit("typing", { conversationId, senderId: user._id });
      }

      const delayDebounce = setTimeout(() => {
        setTyping(false);
        socket.emit("stopTyping", { conversationId, senderId: user._id });
      }, 2000);

      return () => clearTimeout(delayDebounce);
    } else {
      if (typing) {
        setTyping(false);
        socket.emit("stopTyping", { conversationId, senderId: user._id });
      }
    }
  }, [typedMessage, plannerId, user?._id, typing]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !socketRef.current) return;

    const conversationId = [user._id, plannerId].sort().join("_");

    socketRef.current.emit("sendMessage", {
      conversationId,
      senderId: user._id,
      receiverId: plannerId,
      text: typedMessage
    });

    setTypedMessage('');
    setTyping(false);
    socketRef.current.emit("stopTyping", { conversationId, senderId: user._id });
  };

  const handleAttachImage = () => {
    const imageUrl = prompt("Enter a wedding concept image URL to share:", "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600");
    if (!imageUrl || !socketRef.current) return;
    
    const conversationId = [user._id, plannerId].sort().join("_");
    socketRef.current.emit("sendMessage", {
      conversationId,
      senderId: user._id,
      receiverId: plannerId,
      text: "Concept Photo:",
      image: imageUrl
    });
    setAttachmentOpen(false);
  };

  const handleAttachFile = () => {
    const fileName = prompt("Enter document filename to upload:", "Wedding_Catering_Invoice.pdf");
    if (!fileName || !socketRef.current) return;
    
    const conversationId = [user._id, plannerId].sort().join("_");
    socketRef.current.emit("sendMessage", {
      conversationId,
      senderId: user._id,
      receiverId: plannerId,
      text: `Attached Document: ${fileName}`,
      file: fileName
    });
    setAttachmentOpen(false);
  };

  // Helper to dynamically route chat navigation based on role
  const handleChatUserNavigation = (targetUserId) => {
    navigate(`/${user.role}/chat/${targetUserId}`);
  };

  // Profile image selector helper
  const getProfileImage = (convItem) => {
    return convItem.profile?.profileImage || convItem.profile?.vendorLogo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256";
  };

  return (
    <div className="h-[calc(100vh-140px)] flex border border-rosegold/20 dark:border-goldAccent/15 rounded-3xl overflow-hidden bg-white dark:bg-darkcard shadow-lg relative">
      
      {/* 1. Left side: Dialogues list */}
      <div className={`w-full md:w-[320px] border-r border-rosegold/20 dark:border-goldAccent/15 flex flex-col ${
        plannerId && plannerId !== 'list' ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-rosegold/20 dark:border-goldAccent/15">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Active Dialogues</h3>
          <p className="text-[10px] text-slate-500 mt-1">Direct message panel with wedding coordinators</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-cream/30 dark:divide-goldAccent/10">
          {listLoading && (
            <div className="p-4 text-center text-xs text-slate-450 animate-pulse">Loading channels...</div>
          )}
          {!listLoading && displayConversations.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">No active dialogues yet.</div>
          )}
          {!listLoading && displayConversations.map((cItem) => {
            const isSelected = cItem.user._id === plannerId;

            return (
              <div
                key={cItem.user._id}
                onClick={() => handleChatUserNavigation(cItem.user._id)}
                className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-cream/45 dark:bg-darkbg/40 border-l-4 border-accent' : 'hover:bg-cream/20 dark:hover:bg-darkcard/30'
                }`}
              >
                <div className="relative">
                  <img
                    src={getProfileImage(cItem)}
                    alt={getDisplayName(cItem)}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200/50"
                  />
                  {(onlineUsers.has(cItem.user._id) || cItem.user._id === plannerId) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-darkcard" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{getDisplayName(cItem)}</h4>
                    {cItem.unreadCount > 0 && (
                      <span className="bg-accent text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">
                        {cItem.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 capitalize">
                    {cItem.user.role}
                    {getDisplayName(cItem) !== cItem.user.name ? ` • ${cItem.user.name}` : ''}
                  </p>
                  <p className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate mt-1">
                    {cItem.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right side: Chat Window */}
      <div className={`flex-1 flex flex-col bg-cream/10 dark:bg-darkbg/40 ${
        !plannerId || plannerId === 'list' ? 'hidden md:flex justify-center items-center p-8' : 'flex'
      }`}>
        
        {!plannerId || plannerId === 'list' ? (
          <div className="text-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto shadow-inner">
              <FiCamera className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white uppercase tracking-tight">Your Inbox</h3>
            <p className="text-xs text-slate-500">Select a dialogue partner from the left to start a real-time conversation and collaborate on wedding events.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 bg-white dark:bg-darkcard border-b border-rosegold/20 dark:border-goldAccent/15 flex justify-between items-center">
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(`/${user.role}/chat/list`)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-cream dark:hover:bg-darkcard text-slate-500"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={activeConversation ? getProfileImage(activeConversation) : (recipientProfile?.profileImage || recipientProfile?.vendorLogo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256")}
                    alt={activeConversation ? getDisplayName(activeConversation) : (recipientUser?.name || "User")}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-darkcard" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {activeConversation ? getDisplayName(activeConversation) : recipientUser?.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {recipientUser?.role}
                    {activeConversation && getDisplayName(activeConversation) !== recipientUser?.name ? ` • Contact: ${recipientUser?.name}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2.5 rounded-xl hover:bg-cream dark:hover:bg-darkcard text-slate-500 transition-colors">
                  <FiPhone className="w-4.5 h-4.5" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-cream dark:hover:bg-darkcard text-slate-500 transition-colors">
                  <FiVideo className="w-4.5 h-4.5" />
                </button>
              </div>

            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              
              {messagesLoading && (
                <div className="text-center text-xs text-slate-450 py-10 animate-pulse">Loading message deck...</div>
              )}

              {!messagesLoading && messages.map((msg) => {
                const isMine = msg.sender === user._id;

                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm relative ${
                      isMine 
                        ? 'bg-gradient-to-r from-accent to-primary text-slate-950 rounded-br-none' 
                        : 'bg-white dark:bg-darkcard text-slate-800 dark:text-slate-200 rounded-bl-none border border-rosegold/20 dark:border-goldAccent/15'
                    }`}>
                      
                      <p className="text-xs leading-relaxed font-medium">{msg.message}</p>
                      
                      {msg.image && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200/25 max-w-[240px]">
                          <img src={msg.image} alt="concept" className="w-full object-cover max-h-[160px]" />
                        </div>
                      )}

                      {msg.file && (
                        <div className="mt-2.5 p-2 rounded-xl bg-slate-100/10 backdrop-blur flex items-center space-x-2 border border-slate-200/10">
                          <FiPaperclip className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="text-[10px] font-bold truncate max-w-[150px]">{msg.file}</span>
                        </div>
                      )}

                      <div className="flex justify-end items-center space-x-1 mt-2 text-[9px] opacity-60">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && (
                          msg.read 
                            ? <FiCheckCircle className="text-emerald-500 w-3 h-3" /> 
                            : <FiCheck className="text-slate-400 w-3 h-3" />
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}

              {partnerTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-darkcard rounded-2xl rounded-bl-none p-4 shadow-sm border border-rosegold/20 dark:border-goldAccent/15 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce delay-150" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce delay-300" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Field */}
            <div className="p-4 bg-white dark:bg-darkcard border-t border-rosegold/20 dark:border-goldAccent/15 relative">
              
              <AnimatePresence>
                {attachmentOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-4 bg-white dark:bg-darkcard border border-rosegold/20 dark:border-goldAccent/15 rounded-2xl p-2.5 shadow-xl flex flex-col space-y-1 z-20 text-[11px] font-bold"
                  >
                    <button
                      onClick={handleAttachImage}
                      className="px-4 py-2 hover:bg-cream dark:hover:bg-darkcard rounded-xl flex items-center space-x-2 text-slate-700 dark:text-slate-350"
                    >
                      <FiCamera className="w-4.5 h-4.5 text-accent" />
                      <span>Share Photo</span>
                    </button>
                    <button
                      onClick={handleAttachFile}
                      className="px-4 py-2 hover:bg-cream dark:hover:bg-darkcard rounded-xl flex items-center space-x-2 text-slate-700 dark:text-slate-350"
                    >
                      <FiPaperclip className="w-4.5 h-4.5 text-accent" />
                      <span>Attach Document</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSend} className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setAttachmentOpen(!attachmentOpen)}
                  className={`p-3 rounded-2xl hover:bg-cream dark:hover:bg-darkcard text-slate-500 transition-colors ${
                    attachmentOpen ? 'bg-cream dark:bg-darkcard text-accent' : ''
                  }`}
                >
                  <FiPaperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="Type a message to discuss your wedding brief..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-cream/10 dark:bg-darkbg/50 border border-rosegold/20 dark:border-goldAccent/15 outline-none text-sm transition-all focus:border-accent text-slate-850 dark:text-slate-100"
                />

                <motion.button
                  type="submit"
                  disabled={!typedMessage.trim()}
                  className="p-3.5 bg-gradient-to-r from-accent to-primary text-slate-950 rounded-2xl shadow-lg shadow-accent/20 flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSend className="w-5 h-5" />
                </motion.button>
              </form>

            </div>
          </>
        )}

      </div>

    </div>
  );
};

export default DirectChat;
