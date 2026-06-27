import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';

const SparklesIcon = (props) => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
  </svg>
);

const QUICK_ACTIONS = [
  'Find Wedding Venues',
  'Plan My Budget',
  'Wedding Timeline',
  'Theme Ideas',
  'Destination Wedding',
  'Food Planning',
  'Decor Ideas',
  'Guest Management',
  'Outfit Suggestions'
];

const WELCOME_MESSAGE = "Hi! 👋 I'm your EvenAfter AI Wedding Planner. I can help you choose venues, estimate budgets, create timelines, suggest themes, plan ceremonies, and answer almost anything related to weddings. What would you like to plan today?";

export const AIWeddingPlanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('evenafter_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading chat session history', e);
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'ai',
        text: WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  // Sync message history to session storage
  useEffect(() => {
    sessionStorage.setItem('evenafter_ai_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Autoscroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow render completion
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    if (!textToSend) {
      setInput('');
    }
    setError('');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: timestamp
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to backend AI endpoint, setting a 30s timeout
      const response = await api.post('/ai/chat', {
        messages: [...messages, userMessage]
      }, { timeout: 30000 });

      const aiResponse = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: response.data.data?.text || "I am processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      let errMsg = "Sorry, I am unable to connect to my planner resources right now. Please try again in a moment.";
      if (err.code === 'ECONNABORTED') {
        errMsg = "My planner request timed out. Please try asking a simpler question.";
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your wedding planning chat history?")) {
      const resetMessages = [
        {
          id: 'welcome',
          sender: 'ai',
          text: WELCOME_MESSAGE,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(resetMessages);
      setError('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to format AI replies
  const formatMessageText = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line;
      
      // Parse bullet points
      const isBullet = /^\s*[\*\-•]\s+/.test(content);
      if (isBullet) {
        content = content.replace(/^\s*[\*\-•]\s+/, "");
      }
      
      // Parse bolding
      const parts = content.split(/\*\*([^*]+)\*\*/g);
      const parsedLine = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-bold text-rosegold dark:text-goldAccent">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 my-0.5 text-sm leading-relaxed">
            {parsedLine}
          </li>
        );
      }
      
      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "my-0.5 text-sm leading-relaxed"}>
          {parsedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-rosegold text-white dark:bg-goldAccent dark:text-black shadow-xl hover:shadow-2xl flex items-center justify-center border border-rosegold/10 dark:border-goldAccent/10 cursor-pointer"
        style={{
          boxShadow: '0 10px 25px -5px rgba(183, 137, 142, 0.4), 0 8px 10px -6px rgba(183, 137, 142, 0.4)'
        }}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border border-white dark:border-black"></span>
          </span>
        )}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[580px] max-h-[80vh] flex flex-col rounded-2xl border border-rosegold/20 dark:border-goldAccent/15 bg-white dark:bg-darkbg shadow-2xl overflow-hidden max-w-[calc(100vw-32px)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-ivory to-cream dark:from-darkbg dark:to-darkcard border-b border-rosegold/20 dark:border-goldAccent/15">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rosegold/10 dark:bg-goldAccent/10 flex items-center justify-center text-rosegold dark:text-goldAccent border border-rosegold/20 dark:border-goldAccent/20">
                  <SparklesIcon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-sm text-darktext dark:text-goldAccent tracking-wide">
                    EvenAfter AI
                  </h3>
                  <p className="font-roboto text-[10px] text-rosegold dark:text-goldAccent/80 uppercase tracking-widest font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    Wedding Planner
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {messages.length > 1 && (
                  <button
                    onClick={handleClearHistory}
                    title="Clear history"
                    className="p-2 rounded-lg text-darktext/50 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-darktext/50 dark:text-gray-400 hover:bg-cream dark:hover:bg-darkcard transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-ivory/30 dark:bg-darkbg/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-rosegold text-white rounded-tr-none'
                          : 'bg-cream/60 dark:bg-darkcard/80 text-darktext dark:text-gray-200 border border-rosegold/10 dark:border-goldAccent/10 rounded-tl-none'
                      }`}
                    >
                      {formatMessageText(msg.text)}
                    </div>
                    <span className="text-[9px] text-darktext/40 dark:text-gray-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex flex-col items-start max-w-[80%]">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-cream/60 dark:bg-darkcard/80 text-darktext dark:text-gray-250 border border-rosegold/10 dark:border-goldAccent/10 flex items-center space-x-1.5 h-[40px]">
                      <span className="w-1.5 h-1.5 bg-rosegold dark:bg-goldAccent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-rosegold dark:bg-goldAccent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-rosegold dark:bg-goldAccent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Scroll Bar */}
            <div className="px-4 py-2 border-t border-rosegold/10 dark:border-goldAccent/10 bg-ivory/10 dark:bg-darkbg/10 overflow-x-auto whitespace-nowrap flex items-center space-x-2 scrollbar-none">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => handleSend(action)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs rounded-full border border-rosegold/30 dark:border-goldAccent/25 text-rosegold dark:text-goldAccent hover:bg-rosegold hover:text-white dark:hover:bg-goldAccent dark:hover:text-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Message Input Panel */}
            <div className="p-4 border-t border-rosegold/20 dark:border-goldAccent/15 bg-white dark:bg-darkbg flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your planner anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-rosegold/20 dark:border-goldAccent/15 bg-cream/20 dark:bg-darkcard/50 text-darktext dark:text-white placeholder-darktext/40 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rosegold/50 dark:focus:ring-goldAccent/50 focus:border-transparent text-sm disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-rosegold text-white dark:bg-goldAccent dark:text-black hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIWeddingPlanner;
