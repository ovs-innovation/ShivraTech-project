import { useCallback, useEffect, useState } from "react";
import { RefreshCcw, Search, Trash2 } from "lucide-react";
import { apiGetUsers, apiDeleteUser } from "../../api";
import { Spinner, ActionBtn, iconBtn, inputWithIcon, tableStyle, thStyle, tdStyle } from "../../components/UI";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function CustomersTab({ showToast, showConfirm }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.append("role", "customer");
      if (search) p.append("search", search);
      const res = await apiGetUsers(p.toString());
      setUsers(res.data?.users || []);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id, name) => showConfirm(
    `Delete customer "${name}"? This cannot be undone.`,
    async () => {
      try { await apiDeleteUser(id); showToast("Customer deleted"); load(); }
      catch (e) { showToast(e.message, "error"); }
    }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", gap: "12px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
          <input id="customer-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers by name or email..." style={inputWithIcon} />
        </div>
        <button onClick={load} style={iconBtn} title="Refresh"><RefreshCcw size={16} /></button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ overflowX: "auto", background: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
          <table style={tableStyle}>
            <thead><tr>
              {["Customer", "Email", "Phone", "Joined", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {users.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>No customers found</td></tr>
                : users.map(u => (
                  <tr key={u._id}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#3b82f622", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontWeight: 800 }}>{u.name?.[0]}</div>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={tdStyle}><span style={{ color: "var(--text-secondary)" }}>{u.email}</span></td>
                    <td style={tdStyle}><span style={{ color: "var(--text-secondary)" }}>{u.phone || "—"}</span></td>
                    <td style={tdStyle}><span style={{ color: "var(--text-muted)" }}>{formatDate(u.createdAt)}</span></td>
                    <td style={tdStyle}>
                      <ActionBtn color="#ef4444" title="Delete" onClick={() => handleDelete(u._id, u.name)}><Trash2 size={14} /></ActionBtn>
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
