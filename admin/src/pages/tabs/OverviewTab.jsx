import { useCallback, useEffect, useState } from "react";
import { BarChart2, ClipboardList, IndianRupee, Package, ShoppingBag, Store, Users, Activity } from "lucide-react";
import { apiGetAnalytics } from "../../api";
import { Badge, Spinner, cardStyle, tableStyle, thStyle, tdStyle } from "../../components/UI";

const formatRupees = (v = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_COLORS = {
  Placed: "#6366f1", Accepted: "#3b82f6", Packed: "#8b5cf6",
  "Ready for Dispatch": "#06b6d4", Shipped: "#f59e0b",
  Delivered: "#10b981", Cancelled: "#ef4444", Returned: "#f97316",
};

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div
    style={{
      background: gradient || "var(--stat-card-gradient)",
      border: `1px solid ${color}33`, borderRadius: "16px", padding: "24px",
      display: "flex", flexDirection: "column", gap: "14px",
      boxShadow: "var(--card-shadow)",
      transition: "transform 0.2s,box-shadow 0.2s", cursor: "default",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${color}25`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--card-shadow)"; }}
  >
    <div style={{ width: 44, height: 44, borderRadius: "12px", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ color: "var(--text-primary)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>{label}</div>
    </div>
  </div>
);

export default function OverviewTab({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetAnalytics();
      setData(res.data);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!data) return null;

  const { stats, recentOrders = [], recentUsers = [], monthlyData = [] } = data;
  const maxRev = Math.max(...monthlyData.map(m => m.revenue), 1);

  const cards = [
    { icon: IndianRupee, label: "Total Revenue", value: formatRupees(stats.totalRevenue), color: "#10b981", gradient: "linear-gradient(135deg,#064e3b18,#10b98120)" },
    { icon: ShoppingBag, label: "Total Orders", value: stats.totalOrders?.toLocaleString() ?? "0", color: "#6366f1" },
    { icon: Users, label: "Customers", value: stats.totalUsers?.toLocaleString() ?? "0", color: "#3b82f6" },
    { icon: Store, label: "Vendors", value: stats.totalVendors?.toLocaleString() ?? "0", color: "#8b5cf6" },
    { icon: Package, label: "Products", value: stats.totalProducts?.toLocaleString() ?? "0", color: "#f59e0b" },
    { icon: Activity, label: "Pending", value: stats.pendingOrders?.toLocaleString() ?? "0", color: "#ef4444" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Stat Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: "16px" }}>
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Bar Chart */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <BarChart2 size={18} color="#10b981" />
            <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>Monthly Revenue</span>
          </div>
          {monthlyData.length === 0
            ? <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No data yet</p>
            : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px" }}>
                {monthlyData.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                       <div
                        title={formatRupees(m.revenue)}
                        style={{
                          width: "100%",
                          height: `${Math.max((m.revenue / maxRev) * 100, 4)}%`,
                          background: "linear-gradient(to top,#10b981,#34d399)",
                          borderRadius: "6px 6px 0 0", transition: "height 0.6s ease",
                        }}
                      />
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "6px", whiteSpace: "nowrap" }}>{m.month}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Status Bars */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <ClipboardList size={18} color="#6366f1" />
            <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>Order Status</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "Completed", val: stats.completedOrders ?? 0, color: "#10b981" },
              { label: "Pending", val: stats.pendingOrders ?? 0, color: "#f59e0b" },
              { label: "Cancelled", val: stats.cancelledOrders ?? 0, color: "#ef4444" },
            ].map((s, i) => {
              const pct = stats.totalOrders > 0 ? Math.round((s.val / stats.totalOrders) * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700, fontSize: "13px" }}>{s.val} ({pct}%)</span>
                  </div>
                  <div style={{ background: "var(--border-subtle)", borderRadius: "999px", height: "8px" }}>
                    <div style={{ width: `${pct}%`, background: s.color, borderRadius: "999px", height: "8px", transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <ShoppingBag size={18} color="#6366f1" />
          <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>Recent Orders</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>{["Order ID", "Customer", "Amount", "Status", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o._id}>
                  <td style={tdStyle}><span style={{ color: "#a78bfa", fontWeight: 700 }}>{o.orderId}</span></td>
                  <td style={tdStyle}><span style={{ color: "var(--text-secondary)" }}>{o.user?.name || o.customerName}</span></td>
                  <td style={tdStyle}><span style={{ color: "#10b981", fontWeight: 700 }}>{formatRupees(o.totalAmount)}</span></td>
                  <td style={tdStyle}><Badge color={STATUS_COLORS[o.orderStatus] || "#6b7280"}>{o.orderStatus}</Badge></td>
                  <td style={tdStyle}><span style={{ color: "var(--text-muted)" }}>{formatDate(o.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Signups */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <Users size={18} color="#3b82f6" />
          <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>Recent Signups</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "12px" }}>
          {recentUsers.map(u => (
            <div key={u._id} style={{ background: "var(--bg-surface-alt)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.role === "seller" ? "#8b5cf622" : "#3b82f622", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: u.role === "seller" ? "#8b5cf6" : "#3b82f6", fontWeight: 800, fontSize: "14px" }}>{u.name?.[0]}</span>
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>{u.role} · {formatDate(u.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
