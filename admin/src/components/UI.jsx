import { CheckCircle, X, XCircle } from "lucide-react";

export const Toast = ({ msg, type = "success", onClose }) => (
  <div style={{
    position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
    background: type === "success" ? "#10b981" : "#ef4444",
    color: "#fff", padding: "12px 20px", borderRadius: "12px",
    display: "flex", alignItems: "center", gap: "10px",
    fontWeight: 600, fontSize: "14px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
    animation: "slideUp 0.3s ease",
  }}>
    {type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
    {msg}
    <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: 8 }}>
      <X size={16} />
    </button>
  </div>
);

export const Badge = ({ children, color = "#6366f1" }) => (
  <span style={{
    background: `${color}22`, color, border: `1px solid ${color}44`,
    borderRadius: "6px", padding: "2px 10px",
    fontSize: "11px", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.5px",
  }}>
    {children}
  </span>
);

export const Spinner = ({ size = 32 }) => (
  <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
    <span style={{
      width: size, height: size, borderRadius: "50%",
      border: "3px solid var(--border-color)", borderTop: "3px solid #6366f1",
      display: "inline-block", animation: "spin 0.8s linear infinite",
    }} />
  </div>
);

export const ActionBtn = ({ children, color, title, onClick }) => (
  <button onClick={onClick} title={title} style={{
    width: 32, height: 32, borderRadius: "8px",
    border: `1px solid ${color}44`, background: `${color}11`,
    color, cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", transition: "all 0.15s",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}33`; e.currentTarget.style.transform = "scale(1.08)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = `${color}11`; e.currentTarget.style.transform = "scale(1)"; }}
  >
    {children}
  </button>
);

export const Pagination = ({ page, pages, setPage }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: "12px", alignItems: "center", paddingTop: "8px" }}>
    <button disabled={page <= 1} onClick={() => setPage(page - 1)}
      style={{ ...btnIcon, opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}>
      ‹
    </button>
    <span style={{ color: "#9ca3af", fontSize: "14px" }}>Page {page} of {pages}</span>
    <button disabled={page >= pages} onClick={() => setPage(page + 1)}
      style={{ ...btnIcon, opacity: page >= pages ? 0.4 : 1, cursor: page >= pages ? "not-allowed" : "pointer" }}>
      ›
    </button>
  </div>
);

export const ConfirmDialog = ({ msg, onConfirm, onCancel }) => (
  <div style={overlay}>
    <div style={{ ...modal, maxWidth: "380px", textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
      <p style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Are you sure?</p>
      <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>{msg}</p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <button onClick={onCancel} style={cancelBtn}>Cancel</button>
        <button onClick={onConfirm} style={{ ...primaryBtn, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>Confirm</button>
      </div>
    </div>
  </div>
);

// Shared style exports
const btnIcon = {
  width: 36, height: 36, borderRadius: "10px",
  border: "1px solid var(--border-color)", background: "var(--bg-surface-alt)",
  color: "var(--text-primary)", fontSize: "20px", lineHeight: 1,
  display: "flex", alignItems: "center", justifyContent: "center",
};
export const overlay = {
  position: "fixed", inset: 0, background: "var(--modal-overlay)",
  backdropFilter: "blur(6px)", display: "flex",
  alignItems: "center", justifyContent: "center", zIndex: 9000,
};
export const modal = {
  background: "var(--modal-bg)", border: "1px solid var(--border-color)",
  borderRadius: "20px", padding: "32px",
  width: "90%", maxWidth: "480px",
  maxHeight: "90vh", overflowY: "auto",
  color: "var(--text-primary)",
};
export const primaryBtn = {
  display: "flex", alignItems: "center", gap: "8px",
  padding: "10px 20px", borderRadius: "10px", border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer",
};
export const cancelBtn = {
  padding: "10px 20px", borderRadius: "10px",
  border: "1px solid var(--border-color)", background: "transparent",
  color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "14px",
};
export const inputStyle = {
  width: "100%", padding: "10px 12px",
  background: "var(--input-bg)", border: "1px solid var(--input-border)",
  borderRadius: "10px", color: "var(--text-primary)",
  fontSize: "14px", outline: "none",
};
export const inputWithIcon = { ...inputStyle, paddingLeft: "36px" };
export const selectStyle = {
  padding: "10px 12px", background: "var(--input-bg)",
  border: "1px solid var(--input-border)", borderRadius: "10px",
  color: "var(--text-primary)", fontSize: "14px", outline: "none", cursor: "pointer",
};
export const iconBtn = {
  width: 40, height: 40, borderRadius: "10px",
  border: "1px solid var(--border-color)", background: "var(--bg-surface-alt)",
  color: "var(--text-secondary)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
export const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: "13px" };
export const thStyle = {
  textAlign: "left", padding: "10px 14px", color: "var(--text-secondary)",
  fontWeight: 600, fontSize: "11px", textTransform: "uppercase",
  letterSpacing: "0.6px", whiteSpace: "nowrap", borderBottom: "1px solid var(--border-color)",
};
export const tdStyle = {
  padding: "13px 14px", verticalAlign: "middle", borderBottom: "1px solid var(--table-border)",
  color: "var(--text-primary)",
};
export const cardStyle = {
  background: "var(--card-bg)", border: "1px solid var(--card-border)",
  borderRadius: "16px", padding: "24px", boxShadow: "var(--card-shadow)",
};
