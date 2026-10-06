import { useCallback, useEffect, useState } from "react";
import { RefreshCcw, Search, ShieldCheck, ShieldOff, Shield } from "lucide-react";
import { apiGetVendors, apiApproveVendor, apiSuspendVendor } from "../../api";
import { Badge, Spinner, ActionBtn, iconBtn, inputWithIcon, selectStyle, tableStyle, thStyle, tdStyle } from "../../components/UI";

const formatRupees = (v = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function VendorsTab({ showToast, showConfirm }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append("search", search);
      if (filter) p.append("status", filter);
      const res = await apiGetVendors(p.toString());
      setVendors(res.data?.vendors || []);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = (id, approved) => showConfirm(
    approved ? "Approve this vendor?" : "Reject this vendor's verification?",
    async () => {
      try { await apiApproveVendor(id, approved); showToast(approved ? "Vendor approved!" : "Vendor rejected"); load(); }
      catch (e) { showToast(e.message, "error"); }
    }
  );

  const handleSuspend = (id) => showConfirm(
    "Suspend this vendor? They will lose seller access.",
    async () => {
      try { await apiSuspendVendor(id); showToast("Vendor suspended"); load(); }
      catch (e) { showToast(e.message, "error"); }
    }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
          <input id="vendor-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." style={inputWithIcon} />
        </div>
        <select id="vendor-filter" value={filter} onChange={e => setFilter(e.target.value)} style={selectStyle}>
          <option value="">All Vendors</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
        <button onClick={load} style={iconBtn} title="Refresh"><RefreshCcw size={16} /></button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ overflowX: "auto", background: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
          <table style={tableStyle}>
            <thead><tr>
              {["Vendor", "Store", "Products", "Orders", "Earnings", "Status", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {vendors.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>No vendors found</td></tr>
                : vendors.map(v => (
                  <tr key={v._id}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#8b5cf622", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, color: "#8b5cf6", fontSize: "14px" }}>{v.name?.[0]}</div>
                        <div>
                          <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{v.name}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{v.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><span style={{ color: "var(--text-secondary)" }}>{v.storeName || "—"}</span></td>
                    <td style={tdStyle}><span style={{ color: "#a78bfa", fontWeight: 700 }}>{v.productCount}</span></td>
                    <td style={tdStyle}><span style={{ color: "#60a5fa", fontWeight: 700 }}>{v.totalOrders}</span></td>
                    <td style={tdStyle}><span style={{ color: "#10b981", fontWeight: 700 }}>{formatRupees(v.earnings)}</span></td>
                    <td style={tdStyle}>{v.isVerifiedSeller ? <Badge color="#10b981">Verified</Badge> : <Badge color="#f59e0b">Pending</Badge>}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {!v.isVerifiedSeller && <ActionBtn color="#10b981" title="Approve" onClick={() => handleApprove(v._id, true)}><ShieldCheck size={14} /></ActionBtn>}
                        {v.isVerifiedSeller && <ActionBtn color="#f59e0b" title="Reject" onClick={() => handleApprove(v._id, false)}><ShieldOff size={14} /></ActionBtn>}
                        <ActionBtn color="#ef4444" title="Suspend" onClick={() => handleSuspend(v._id)}><Shield size={14} /></ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
