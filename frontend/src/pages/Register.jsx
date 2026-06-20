import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiBriefcase,
  FiShoppingBag,
  FiPhone,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const Register = () => {
  const [role, setRole] = useState("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name, email, phone, password, role);
      toast.success("Welcome to the EvenAfter family! Please sign in.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      const errorMsg = error.message || "Registration failed. Please check your data.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register below to join our premium event network"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector cards */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-darktext/70 dark:text-gray-400 tracking-widest uppercase block">
              Select Account Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: "client",
                  label: "Client",
                  icon: FiUser,
                  desc: "Host an event",
                },
                {
                  id: "planner",
                  label: "Planner",
                  icon: FiBriefcase,
                  desc: "Plan events",
                },
                {
                  id: "vendor",
                  label: "Vendor",
                  icon: FiShoppingBag,
                  desc: "Provide services",
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`flex flex-col items-center text-center p-2.5 rounded border transition-all duration-300 ${
                      isSelected
                        ? "bg-rosegold/10 border-rosegold text-rosegold dark:bg-goldAccent/10 dark:border-goldAccent dark:text-goldAccent"
                        : "bg-cream/10 border-rosegold/10 text-darktext/70 hover:border-rosegold/30 hover:text-darktext dark:bg-darkbg/25 dark:border-goldAccent/10 dark:text-gray-400 dark:hover:border-goldAccent/30 dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      className="text-base mb-1"
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
                    <span className="text-[8px] opacity-75 mt-0.5 leading-tight hidden sm:block">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-darktext/70 dark:text-gray-400 tracking-widest uppercase block">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-darktext/40 dark:text-gray-500">
                <FiUser className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-cream/10 dark:bg-darkbg/25 border border-rosegold/20 dark:border-goldAccent/20 rounded py-2 pl-9 pr-4 text-xs text-darktext dark:text-white placeholder-darktext/35 dark:placeholder-gray-600 focus:outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/20 dark:focus:ring-goldAccent/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-darktext/70 dark:text-gray-400 tracking-widest uppercase block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-darktext/40 dark:text-gray-500">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@example.com"
                required
                className="w-full bg-cream/10 dark:bg-darkbg/25 border border-rosegold/20 dark:border-goldAccent/20 rounded py-2 pl-9 pr-4 text-xs text-darktext dark:text-white placeholder-darktext/35 dark:placeholder-gray-600 focus:outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/20 dark:focus:ring-goldAccent/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-darktext/70 dark:text-gray-400 tracking-widest uppercase block">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-darktext/40 dark:text-gray-500">
                <FiPhone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                className="w-full bg-cream/10 dark:bg-darkbg/25 border border-rosegold/20 dark:border-goldAccent/20 rounded py-2 pl-9 pr-4 text-xs text-darktext dark:text-white placeholder-darktext/35 dark:placeholder-gray-600 focus:outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/20 dark:focus:ring-goldAccent/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-darktext/70 dark:text-gray-400 tracking-widest uppercase block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-darktext/40 dark:text-gray-500">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-cream/10 dark:bg-darkbg/25 border border-rosegold/20 dark:border-goldAccent/20 rounded py-2 pl-9 pr-4 text-xs text-darktext dark:text-white placeholder-darktext/35 dark:placeholder-gray-600 focus:outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/20 dark:focus:ring-goldAccent/10 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-darktext/70 dark:text-gray-400 tracking-widest uppercase block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-darktext/40 dark:text-gray-500">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-cream/10 dark:bg-darkbg/25 border border-rosegold/20 dark:border-goldAccent/20 rounded py-2 pl-9 pr-10 text-xs text-darktext dark:text-white placeholder-darktext/35 dark:placeholder-gray-600 focus:outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/20 dark:focus:ring-goldAccent/10 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-darktext/40 dark:text-gray-500 hover:text-darktext dark:hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest py-3 px-4 rounded shadow-sm hover:shadow transition-all duration-350 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4.5 h-4.5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-6 text-center text-xs text-darktext/75 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-rosegold hover:text-rosegold/80 dark:text-goldAccent dark:hover:text-goldAccent/80 hover:underline transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default Register;
