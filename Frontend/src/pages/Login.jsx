import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Store,
  User,
  UserRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const Login = () => {
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCustomer, setIsCustomer] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");

  const isSignup = authMode === "signup";
  const accountLabel = isCustomer ? "Customer" : "Vendor";
  const from = location.state?.from?.pathname || (isCustomer ? "/shop" : "/vendor/dashboard");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) throw new Error("Please enter your full name");
        if (!email.trim()) throw new Error("Please enter your email address");
        if (password.length < 6) throw new Error("Password must be at least 6 characters long");
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        if (!isCustomer && !storeName.trim()) throw new Error("Please enter your Store Name");

        const userData = await register({
          name,
          email,
          password,
          role: isCustomer ? "customer" : "seller",
          phone,
          storeName: !isCustomer ? storeName : undefined,
        });

        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          if (userData.role === "seller") {
            navigate("/vendor/dashboard");
          } else {
            navigate("/shop");
          }
        }, 1000);
      } else {
        if (!email.trim() || !password) throw new Error("Please enter your email and password");

        const userData = await login(email, password);
        setSuccessMessage("Logged in successfully! Redirecting...");
        setTimeout(() => {
          if (userData.role === "seller") {
            navigate("/vendor/dashboard");
          } else {
            navigate(from || "/shop");
          }
        }, 800);
      }
    } catch (err) {
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, show quick switch card
  if (isAuthenticated && user) {
    return (
      <section className="px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-xl text-center rounded-[32px] border border-purple-200/80 bg-white p-8 sm:p-10 shadow-[0_20px_50px_rgba(74,13,79,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-[#4A0D4F] mb-4">
            <User size={32} />
          </div>
          <span className="inline-flex rounded-full bg-purple-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#4A0D4F]">
            {user.role === "seller" ? "Vendor Account" : "Customer Account"}
          </span>
          <h2 className="mt-3 text-2xl font-black text-slate-900">
            Welcome back, {user.name}!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            You are currently signed in as <span className="font-semibold text-slate-800">{user.email}</span>
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user.role === "seller" ? (
              <Link
                to="/vendor/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#4A0D4F] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#380B3C]"
              >
                <span>Go to Vendor Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to="/orders"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#4A0D4F] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#380B3C]"
              >
                <span>View My Orders</span>
                <ArrowRight size={16} />
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto rounded-full border border-purple-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div
          className="overflow-hidden rounded-[32px] border bg-white shadow-[0_24px_70px_rgba(74,13,79,0.08)] lg:grid lg:grid-cols-[0.9fr_1.1fr]"
          style={{ borderColor: "#eadbe6" }}
        >
          {/* Left Hero Banner */}
          <div
            className="flex flex-col justify-between gap-8 px-5 py-8 text-white sm:px-8 sm:py-10 md:px-10 md:py-12"
            style={{
              background: `linear-gradient(160deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
            }}
          >
            <div className="space-y-4">
              <span className="inline-flex w-fit rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">
                {accountLabel} Access
              </span>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">
                {isSignup ? `Create ${accountLabel} Account` : `${accountLabel} Sign In`}
              </h1>
              <p className="max-w-md text-sm leading-6 text-white/85">
                {isCustomer
                  ? "Explore aesthetic electronics, flash sales, fast doorstep delivery, and live order tracking."
                  : "Join Shivra as a verified vendor to list gadgets, receive customer orders, pack, dispatch, and track earnings."}
              </p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
              {[
                {
                  label: isCustomer ? "Customer Perks" : "Vendor Hub",
                  text: isCustomer
                    ? "Saved wishlist, fast checkout, and 100% Escrow Buyer Protection."
                    : "Manage catalog, stock levels, set prices, and fulfill orders.",
                  Icon: isCustomer ? UserRound : Store,
                },
                {
                  label: "Safe & Encrypted",
                  text: "Secure JWT auth and bcrypt password protection.",
                  Icon: ShieldCheck,
                },
              ].map(({ label, text, Icon }) => (
                <div
                  key={label}
                  className="rounded-[20px] border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm"
                >
                  <Icon size={18} />
                  <h2 className="mt-2 text-sm font-bold">{label}</h2>
                  <p className="mt-1 text-xs leading-5 text-white/75">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form Area */}
          <div className="px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
            
            {/* Customer vs Vendor Toggle */}
            <div className="flex rounded-full bg-[#f7eef6] p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsCustomer(true);
                  setErrorMessage("");
                }}
                className={`flex-1 rounded-full px-4 py-2.5 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                  isCustomer ? "text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                style={{
                  background: isCustomer
                    ? `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`
                    : "transparent",
                }}
              >
                <User size={15} />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCustomer(false);
                  setErrorMessage("");
                }}
                className={`flex-1 rounded-full px-4 py-2.5 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                  !isCustomer ? "text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                style={{
                  background: !isCustomer
                    ? `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`
                    : "transparent",
                }}
              >
                <Store size={15} />
                <span>Vendor / Seller</span>
              </button>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs font-semibold text-rose-700">
                <AlertCircle size={17} className="flex-shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={17} className="flex-shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Mode Toggle (Login vs Sign Up) */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                {isSignup
                  ? isCustomer
                    ? "Create Customer Account"
                    : "Register as a Vendor"
                  : isCustomer
                    ? "Customer Sign In"
                    : "Vendor Sign In"}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                {isSignup ? "Already registered? " : "New to ShivraTech? "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(isSignup ? "login" : "signup");
                    setErrorMessage("");
                  }}
                  className="font-bold underline underline-offset-4 text-[#4A0D4F] hover:text-[#B35FA3]"
                >
                  {isSignup ? "Sign in here" : "Create an account"}
                </button>
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Henderson"
                      className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-[#B35FA3] focus:bg-white focus:ring-2 focus:ring-[#B35FA3]/15"
                    />
                  </div>
                </div>
              )}

              {isSignup && !isCustomer && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store / Business Name
                  </label>
                  <div className="relative">
                    <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Apex Audio Labs"
                      className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-[#B35FA3] focus:bg-white focus:ring-2 focus:ring-[#B35FA3]/15"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. you@example.com"
                    className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-[#B35FA3] focus:bg-white focus:ring-2 focus:ring-[#B35FA3]/15"
                  />
                </div>
              </div>

              {isSignup && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-[#B35FA3] focus:bg-white focus:ring-2 focus:ring-[#B35FA3]/15"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-[#B35FA3] focus:bg-white focus:ring-2 focus:ring-[#B35FA3]/15"
                  />
                </div>
              </div>

              {isSignup && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-[#B35FA3] focus:bg-white focus:ring-2 focus:ring-[#B35FA3]/15"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 active:scale-98 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                  }}
                >
                  <span>{loading ? "Processing..." : isSignup ? "Create Account" : "Sign In"}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-purple-100 pt-4 text-center">
              <p className="text-xs text-slate-400">
                By continuing, you agree to ShivraTech Terms of Service & Privacy Policy.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
