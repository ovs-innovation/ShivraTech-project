import { useState } from "react";
import { Loader2, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
          ? "radial-gradient(ellipse at 60% 40%, #1a1a3e 0%, #0f0f1a 60%)"
          : "radial-gradient(ellipse at 60% 40%, #f1ecf9 0%, #f7f6fb 60%)",
        transition: "background 0.25s ease",
        position: "relative",
      }}
    >
      {/* Theme Toggle Button */}
      <button
        id="login-theme-toggle"
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "7px 14px",
          cursor: "pointer",
          color: "var(--text-primary)",
          fontSize: "12px",
          fontWeight: 700,
          zIndex: 100,
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
        }}
      >
        {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#8b5cf6" />}
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      </button>

      {/* Glow circles */}
      <div
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, #6366f125, transparent 70%)",
          top: "-100px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, #8b5cf620, transparent 70%)",
          bottom: "-100px",
          right: "-100px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          margin: "0 24px",
          background: isDark ? "rgba(30,30,46,0.92)" : "rgba(255,255,255,0.92)",
          border: "1px solid var(--border-color)",
          borderRadius: "24px",
          padding: "44px 36px",
          backdropFilter: "blur(20px)",
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.5)"
            : "0 24px 60px rgba(74,13,79,0.08)",
          animation: "fadeIn 0.4s ease",
          transition: "background 0.25s ease, border-color 0.25s ease",
        }}
      >
        {/* Company Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <img
              src={logo}
              alt="Shivra Logo"
              style={{
                height: "44px",
                width: "auto",
                objectFit: "contain",
                display: "block",
                filter: "var(--logo-filter)",
                transition: "filter 0.25s ease",
              }}
            />
          </div>
          <h1
            style={{
              color: "var(--text-primary)",
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Platform Control & Management
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#ef444422",
              border: "1px solid #ef444444",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#ef4444",
              fontSize: "14px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="admin-email"
              style={{
                display: "block",
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shivratech.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "var(--input-border)")}
            />
          </div>
          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: "block",
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "var(--input-border)")}
            />
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              marginTop: "8px",
              borderRadius: "12px",
              border: "none",
              background: loading ? "#4b5563" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.2s, transform 0.1s",
              boxShadow: loading ? "none" : "0 4px 20px #6366f140",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading && <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            padding: "12px 14px",
            background: "var(--bg-surface-alt)",
            borderRadius: "12px",
            border: "1px dashed var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 600 }}>
              Default Admin Credentials:
            </div>
            <div
              style={{
                color: isDark ? "#c7d2fe" : "#4A0D4F",
                fontSize: "12px",
                fontFamily: "monospace",
                marginTop: "2px",
                fontWeight: 600,
              }}
            >
              admin@shivratech.com / adminpassword123
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@shivratech.com");
              setPassword("adminpassword123");
            }}
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: isDark ? "#a5b4fc" : "#6366f1",
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Auto-fill
          </button>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>
          🔒 Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
