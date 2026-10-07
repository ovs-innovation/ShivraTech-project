import React, { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Store,
  UploadCloud,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { apiUploadImage } from "../services/api";

const PRIMARY = "#4A0D4F";

const Login = () => {
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCustomer, setIsCustomer] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [businessType, setBusinessType] = useState("Individual / Sole Proprietor");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [businessDocUrl, setBusinessDocUrl] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const isSignup = authMode === "signup";
  const accountLabel = isCustomer ? "Customer" : "Vendor";
  const from = location.state?.from?.pathname || (isCustomer ? "/shop" : "/vendor/dashboard");

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    setErrorMessage("");
    try {
      const res = await apiUploadImage(file);
      if (res.data?.url) {
        setBusinessDocUrl(res.data.url);
        setSuccessMessage("Verification document attached successfully!");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to upload document file");
    } finally {
      setUploadingDoc(false);
    }
  };

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
          businessType: !isCustomer ? businessType : undefined,
          gstNumber: !isCustomer ? gstNumber : undefined,
          panNumber: !isCustomer ? panNumber : undefined,
          businessDocUrl: !isCustomer ? businessDocUrl : undefined,
        });

        setSuccessMessage(
          isCustomer
            ? "Account created successfully! Redirecting..."
            : "Vendor account registered! Awaiting admin verification. Redirecting..."
        );
        setTimeout(() => {
          if (userData.role === "seller") {
            navigate("/vendor/dashboard");
          } else {
            navigate("/shop");
          }
        }, 1200);
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
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-10 px-4 bg-[#FBF8FC]">
        <div className="w-full max-w-[440px] rounded-2xl border border-purple-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(74,13,79,0.06)] text-center">
          <Link to="/" className="inline-block mb-4 focus:outline-none focus:ring-2 focus:ring-[#4A0D4F]/20 rounded-lg">
            <img src={logo} alt="ShivraTech" className="h-9 w-auto mx-auto object-contain" />
          </Link>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100/70 text-[#4A0D4F] mb-3">
            <User size={22} />
          </div>
          <span className="inline-flex rounded-full bg-purple-50 border border-purple-200/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4A0D4F]">
            {user.role === "seller" ? "Vendor Account" : "Customer Account"}
          </span>
          <h2 className="mt-3 text-xl font-bold text-slate-900">
            Welcome back, {user.name}!
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Signed in as <span className="font-semibold text-slate-700">{user.email}</span>
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            {user.role === "seller" ? (
              <Link
                to="/vendor/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A0D4F] hover:bg-[#380B3C] py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99]"
              >
                <span>Vendor Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <Link
                to="/orders"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A0D4F] hover:bg-[#380B3C] py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99]"
              >
                <span>My Orders</span>
                <ArrowRight size={15} />
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft size={14} />
              <span>Back to shop</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-10 px-4 bg-[#FBF8FC]">
      <div className={`w-full ${isSignup && !isCustomer ? "max-w-[520px]" : "max-w-[440px]"} rounded-2xl border border-purple-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(74,13,79,0.06)] transition-all`}>
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3 focus:outline-none focus:ring-2 focus:ring-[#4A0D4F]/20 rounded-lg">
            <img src={logo} alt="ShivraTech" className="h-9 w-auto mx-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isSignup
              ? `Create ${accountLabel} Account`
              : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isSignup
              ? `Enter your details to register as a ${isCustomer ? "customer" : "verified seller"}.`
              : "Sign in to your ShivraTech account."}
          </p>
        </div>

        {/* Customer vs Vendor Segmented Switch */}
        <div className="flex p-1 bg-slate-100/80 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setIsCustomer(true);
              setErrorMessage("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              isCustomer
                ? "bg-white text-[#4A0D4F] shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User size={14} />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCustomer(false);
              setErrorMessage("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isCustomer
                ? "bg-white text-[#4A0D4F] shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store size={14} />
            <span>Vendor / Seller</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs font-medium text-rose-700">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Henderson"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10"
                />
              </div>
            </div>
          )}

          {/* Vendor specific fields when signing up */}
          {isSignup && !isCustomer && (
            <>
              <div>
                <label htmlFor="storeName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Store / Business Name
                </label>
                <div className="relative">
                  <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="storeName"
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Apex Robotics Labs"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="businessType" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Entity Type
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10 cursor-pointer"
                  >
                    <option value="Individual / Sole Proprietor">Individual / Sole Proprietor</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Private Limited (Pvt Ltd)">Private Limited (Pvt Ltd)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="gstNumber" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    GSTIN <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="gstNumber"
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10"
                  />
                </div>
                <div>
                  <label htmlFor="panNumber" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business PAN <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="panNumber"
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business / ID Document (PDF or Image)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-dashed border-purple-200 bg-purple-50/30 px-3.5 py-2.5 text-xs font-medium text-[#4A0D4F] hover:bg-purple-50/70 transition">
                    <UploadCloud size={16} />
                    <span className="truncate">
                      {uploadingDoc
                        ? "Uploading..."
                        : businessDocUrl
                        ? "Document Attached (Click to replace)"
                        : "Upload GST Certificate / Trade License"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleDocumentUpload}
                      disabled={uploadingDoc}
                      className="hidden"
                    />
                  </label>
                  {businessDocUrl && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0" title="Attached">
                      <Check size={16} />
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Admin Verification:</strong> Vendor registrations are verified by Admin before live activation.
                </span>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10"
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              {!isSignup && (
                <Link
                  to="/contact"
                  className="text-xs font-medium text-[#4A0D4F] hover:text-[#B35FA3] transition hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#4A0D4F] focus:ring-2 focus:ring-[#4A0D4F]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A0D4F] hover:bg-[#380B3C] text-white py-2.5 sm:py-3 text-sm font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>
                {loading
                  ? isSignup
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignup
                  ? "Create account"
                  : "Sign in"}
              </span>
            </button>
          </div>
        </form>

        {/* Toggle Mode: Sign In vs Create Account */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {isSignup ? "Already have an account? " : "New to ShivraTech? "}
          <button
            type="button"
            onClick={() => {
              setAuthMode(isSignup ? "login" : "signup");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="font-bold text-[#4A0D4F] hover:text-[#B35FA3] transition underline underline-offset-2"
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </div>

        {/* Back to shop navigation */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
