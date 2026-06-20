import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiBriefcase, FiShoppingBag, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email, password, role);
      toast.success(res.message || "Welcome back to EvenAfter!");
      navigate(`/${role}/dashboard`);
    } catch (error) {
      console.error(error);
      const errorMsg = error.message || "Invalid credentials. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { id: "client", label: "Client", icon: FiUser },
    { id: "planner", label: "Planner", icon: FiBriefcase },
    { id: "vendor", label: "Vendor", icon: FiShoppingBag },
    { id: "superadmin", label: "Admin", icon: FiShield },
  ];

  return (
    <AuthLayout title="Portal Access" subtitle="Select your registry portal and log in">
      {/* Role Selection Tabs */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-6 bg-cream/30 dark:bg-darkbg/40 p-1 rounded-xl border border-rosegold/10 dark:border-goldAccent/10">
        {roles.map((item) => {
          const Icon = item.icon;
          const isActive = role === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleRoleChange(item.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-0.5 sm:px-1 rounded-lg text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                isActive
                  ? "bg-rosegold text-white dark:bg-goldAccent dark:text-black shadow-sm"
                  : "text-darktext/75 dark:text-gray-400 hover:text-rosegold dark:hover:text-goldAccent hover:bg-cream/40 dark:hover:bg-darkbg/50"
              }`}
            >
              <Icon className="text-sm" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
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
              placeholder="name@example.com"
              required
              className="w-full bg-cream/10 dark:bg-darkbg/25 border border-rosegold/20 dark:border-goldAccent/20 rounded py-2.5 pl-9 pr-4 text-sm text-darktext dark:text-white placeholder-darktext/35 dark:placeholder-gray-600 focus:outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/20 dark:focus:ring-goldAccent/10 transition-all duration-300"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-semibold text-darktext/70 dark:text-gray-400 tracking-widest uppercase block">
              Password
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                toast("Password reset is currently under development.", { icon: "⚙️" });
              }}
              className="text-[10px] font-medium text-rosegold hover:text-rosegold/80 dark:text-goldAccent dark:hover:text-goldAccent/80 transition-colors"
            >
              Forgot password?
            </a>
          </div>
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
              className="w-full bg-cream/10 dark:bg-darkbg/25 border border-rosegold/20 dark:border-goldAccent/20 rounded py-2.5 pl-9 pr-10 text-sm text-darktext dark:text-white placeholder-darktext/35 dark:placeholder-gray-600 focus:outline-none focus:border-rosegold dark:focus:border-goldAccent focus:ring-1 focus:ring-rosegold/20 dark:focus:ring-goldAccent/10 transition-all duration-300"
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

        {/* Remember Me */}
        <div className="flex items-center pt-1">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-rosegold/30 text-rosegold focus:ring-rosegold/30 dark:border-goldAccent/30 dark:text-goldAccent dark:focus:ring-goldAccent/30 bg-transparent"
          />
          <label htmlFor="remember-me" className="ml-2 block text-xs text-darktext/70 dark:text-gray-400 font-light">
            Remember me on this device
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 bg-rosegold hover:bg-rosegold/90 dark:bg-goldAccent dark:hover:bg-goldAccent/90 text-white dark:text-black font-semibold text-xs uppercase tracking-widest py-3 px-4 rounded shadow-sm hover:shadow transition-all duration-350 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="w-4.5 h-4.5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            `Login as ${roles.find((r) => r.id === role)?.label}`
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center text-xs text-darktext/75 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-rosegold hover:text-rosegold/80 dark:text-goldAccent dark:hover:text-goldAccent/80 hover:underline transition-colors"
        >
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
