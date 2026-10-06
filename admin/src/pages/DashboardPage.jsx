import { useCallback, useRef, useState } from "react";
import {
  Grid,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ShoppingBag,
  Store,
  Sun,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Toast, ConfirmDialog } from "../components/UI";
import logo from "../assets/logo.png";
import OverviewTab from "./tabs/OverviewTab";
import VendorsTab from "./tabs/VendorsTab";
import CustomersTab from "./tabs/CustomersTab";
import ProductsTab from "./tabs/ProductsTab";
import OrdersTab from "./tabs/OrdersTab";
import CategoriesTab from "./tabs/CategoriesTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "vendors", label: "Vendors", icon: Store },
  { id: "customers", label: "Customers", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "categories", label: "Categories", icon: Grid },
];

export default function DashboardPage() {
  const { admin, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const showConfirm = useCallback((msg, onConfirm) => {
    setConfirm({
      msg,
      onConfirm: () => {
        setConfirm(null);
        onConfirm();
      },
    });
  }, []);

  const tabProps = { showToast, showConfirm };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: collapsed ? 72 : 240,
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Brand with Company Logo */}
        <div
          style={{
            padding: collapsed ? "14px 10px" : "14px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              height: 34,
              overflow: "hidden",
            }}
          >
            <img
              src={logo}
              alt="Shivra Logo"
              style={{
                height: 26,
                width: collapsed ? 26 : "auto",
                maxWidth: collapsed ? 26 : 135,
                objectFit: "contain",
                objectPosition: "left",
                display: "block",
                filter: "var(--logo-filter)",
                transition: "filter 0.25s ease",
              }}
            />
          </div>
          {!collapsed && (
            <div
              style={{
                background: "var(--nav-active-bg)",
                border: "1px solid var(--border-color)",
                color: "var(--nav-active-color)",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "3px 7px",
                borderRadius: "6px",
                whiteSpace: "nowrap",
              }}
            >
              Admin
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: "10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            overflowY: "auto",
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  border: "none",
                  background: active ? "var(--nav-active-bg)" : "transparent",
                  color: active ? "var(--nav-active-color)" : "var(--sidebar-text)",
                  cursor: "pointer",
                  fontWeight: active ? 700 : 500,
                  fontSize: "14px",
                  transition: "all 0.15s",
                  textAlign: "left",
                  width: "100%",
                  borderLeft: active ? "3px solid #8b5cf6" : "3px solid transparent",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--nav-hover)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--sidebar-text)";
                  }
                }}
              >
                <tab.icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Theme Toggle + User + Logout */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Quick theme switcher for collapsed or expanded sidebar */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface-alt)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              width: "100%",
              justifyContent: collapsed ? "center" : "space-between",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--nav-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-surface-alt)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isDark ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#8b5cf6" />}
              {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
            </div>
            {!collapsed && (
              <span style={{ fontSize: "10px", opacity: 0.7, textTransform: "uppercase", fontWeight: 700 }}>
                {theme}
              </span>
            )}
          </button>

          {!collapsed && admin && (
            <div
              style={{
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 700,
                  fontSize: "13px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {admin.name}
              </div>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  fontWeight: 600,
                  marginTop: "2px",
                }}
              >
                Administrator
              </div>
            </div>
          )}

          <button
            id="admin-logout-btn"
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "10px",
              border: "none",
              background: "transparent",
              color: "#ef4444",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              width: "100%",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ef444415";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: "var(--bg-header)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "0 28px",
            height: 64,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "background 0.25s ease, border-color 0.25s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              id="sidebar-toggle"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "18px",
                }}
              >
                {TABS.find((t) => t.id === activeTab)?.label}
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                Shivratech Platform Admin
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Theme Switcher in Header */}
            <button
              id="theme-switcher-header"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-color)",
                borderRadius: "20px",
                padding: "6px 14px",
                cursor: "pointer",
                color: "var(--text-primary)",
                fontSize: "12px",
                fontWeight: 700,
                transition: "all 0.2s ease",
                boxShadow: "var(--card-shadow)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#8b5cf6";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {isDark ? (
                <>
                  <Sun size={15} color="#fbbf24" style={{ flexShrink: 0 }} />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} color="#8b5cf6" style={{ flexShrink: 0 }} />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Admin Avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-surface-alt)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "6px 14px",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {admin?.name?.[0]}
              </div>
              <span
                style={{
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {admin?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {activeTab === "overview" && <OverviewTab {...tabProps} />}
          {activeTab === "vendors" && <VendorsTab {...tabProps} />}
          {activeTab === "customers" && <CustomersTab {...tabProps} />}
          {activeTab === "products" && <ProductsTab {...tabProps} />}
          {activeTab === "orders" && <OrdersTab {...tabProps} />}
          {activeTab === "categories" && <CategoriesTab {...tabProps} />}
        </main>
      </div>

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {confirm && (
        <ConfirmDialog
          msg={confirm.msg}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
