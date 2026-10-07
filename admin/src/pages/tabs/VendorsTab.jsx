import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Building,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Store,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import {
  apiGetVendors,
  apiApproveVendor,
  apiRejectVendor,
  apiSuspendVendor,
  apiReactivateVendor,
  apiUpdateVendorStoreStatus,
  apiVerifyVendorDocument,
} from "../../api";
import {
  Badge,
  Spinner,
  ActionBtn,
  Pagination,
  overlay,
  modal,
  primaryBtn,
  cancelBtn,
  inputWithIcon,
  inputStyle,
  selectStyle,
  iconBtn,
  tableStyle,
  thStyle,
  tdStyle,
  cardStyle,
} from "../../components/UI";

const formatRupees = (v = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Store Status Badge styling
const StoreStatusBadge = ({ status }) => {
  switch (status) {
    case "active":
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#10b98118",
            color: "#10b981",
            border: "1px solid #10b98144",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
          Active Store
        </span>
      );
    case "pending_approval":
    case "pending":
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#f59e0b18",
            color: "#f59e0b",
            border: "1px solid #f59e0b44",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <Clock size={11} />
          Pending Review
        </span>
      );
    case "suspended":
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#ef444418",
            color: "#ef4444",
            border: "1px solid #ef444444",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <Ban size={11} />
          Suspended
        </span>
      );
    case "rejected":
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#64748b18",
            color: "#ef4444",
            border: "1px solid #ef444433",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <XCircle size={11} />
          Rejected
        </span>
      );
    default:
      return <Badge color="#6366f1">{status || "Unknown"}</Badge>;
  }
};

// Documents indicator pill
const DocPill = ({ vendor }) => {
  const hasGst = Boolean(vendor.gstNumber);
  const hasPan = Boolean(vendor.panNumber);
  const hasBusinessDoc = Boolean(vendor.businessDocUrl);
  const hasIdDoc = Boolean(vendor.idProofUrl);
  const count = [hasGst, hasPan, hasBusinessDoc, hasIdDoc].filter(Boolean).length;

  if (vendor.documentVerificationStatus === "verified") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "#10b98115",
          color: "#10b981",
          fontSize: "11px",
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "6px",
          border: "1px solid #10b98133",
        }}
      >
        <FileCheck size={12} />
        KYC Verified
      </span>
    );
  }

  if (count === 0) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "#64748b12",
          color: "var(--text-muted)",
          fontSize: "11px",
          fontWeight: 500,
          padding: "2px 8px",
          borderRadius: "6px",
        }}
      >
        <FileText size={12} />
        No Docs
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "#8b5cf615",
        color: "#a78bfa",
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "6px",
        border: "1px solid #8b5cf633",
      }}
    >
      <FileText size={12} />
      {count} Details / Docs
    </span>
  );
};

export default function VendorsTab({ showToast, showConfirm }) {
  const [vendors, setVendors] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'reject' | 'suspend', vendor: {...}, reason: '' }
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append("search", search);
      if (statusFilter && statusFilter !== "all") p.append("status", statusFilter);
      p.append("page", page);
      p.append("limit", 15);
      const res = await apiGetVendors(p.toString());
      setVendors(res.data?.vendors || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
      if (res.data?.counts) {
        setCounts(res.data.counts);
      }
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
    showToast("Copied to clipboard!");
  };

  // Direct quick approve
  const handleQuickApprove = (v) => {
    showConfirm(`Approve vendor "${v.storeName || v.name}" and activate their store?`, async () => {
      try {
        await apiApproveVendor(v._id);
        showToast(`Vendor "${v.storeName || v.name}" approved successfully!`);
        if (selectedVendor?._id === v._id) {
          setSelectedVendor(null);
        }
        load();
      } catch (e) {
        showToast(e.message, "error");
      }
    });
  };

  // Direct quick reactivate
  const handleQuickReactivate = (v) => {
    showConfirm(`Reactivate vendor store "${v.storeName || v.name}"?`, async () => {
      try {
        await apiReactivateVendor(v._id);
        showToast(`Vendor store "${v.storeName || v.name}" reactivated successfully!`);
        if (selectedVendor?._id === v._id) {
          setSelectedVendor(null);
        }
        load();
      } catch (e) {
        showToast(e.message, "error");
      }
    });
  };

  // Submit reject or suspend with reason from action modal
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionModal) return;
    setActionLoading(true);
    try {
      if (actionModal.type === "reject") {
        await apiRejectVendor(actionModal.vendor._id, actionModal.reason);
        showToast(`Vendor application rejected.`);
      } else if (actionModal.type === "suspend") {
        await apiSuspendVendor(actionModal.vendor._id, actionModal.reason);
        showToast(`Vendor store suspended.`);
      }
      setActionModal(null);
      if (selectedVendor?._id === actionModal.vendor._id) {
        setSelectedVendor(null);
      }
      load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Document verification toggle inside modal
  const handleDocVerify = async (vendorId, status) => {
    try {
      await apiVerifyVendorDocument(vendorId, status);
      showToast(status === "verified" ? "Documents marked as verified!" : "Documents marked as incomplete.");
      // update local modal view
      setSelectedVendor((prev) => (prev ? { ...prev, documentVerificationStatus: status } : prev));
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  // Update store status directly from modal
  const handleStoreStatusChange = async (vendorId, newStatus) => {
    try {
      await apiUpdateVendorStoreStatus(vendorId, newStatus);
      showToast(`Store status updated to ${newStatus}`);
      setSelectedVendor((prev) =>
        prev
          ? {
              ...prev,
              storeStatus: newStatus,
              vendorStatus: newStatus === "active" ? "approved" : newStatus === "pending_approval" ? "pending" : newStatus,
            }
          : prev
      );
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── Top Header & KPI Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Pending Approvals (High Priority) */}
        <div
          onClick={() => {
            setStatusFilter("pending");
            setPage(1);
          }}
          style={{
            ...cardStyle,
            padding: "20px",
            cursor: "pointer",
            border: statusFilter === "pending" ? "1px solid #f59e0b" : "1px solid var(--card-border)",
            background:
              statusFilter === "pending"
                ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.03))"
                : "var(--card-bg)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Pending Approvals
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#f59e0b20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f59e0b",
              }}
            >
              <Clock size={16} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b" }}>{counts.pending}</span>
            {counts.pending > 0 && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#f59e0b",
                  background: "#f59e0b20",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Needs Review
              </span>
            )}
          </div>
        </div>

        {/* Active Stores */}
        <div
          onClick={() => {
            setStatusFilter("approved");
            setPage(1);
          }}
          style={{
            ...cardStyle,
            padding: "20px",
            cursor: "pointer",
            border: statusFilter === "approved" ? "1px solid #10b981" : "1px solid var(--card-border)",
            background:
              statusFilter === "approved"
                ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.03))"
                : "var(--card-bg)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Active Stores
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#10b98120",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
              }}
            >
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#10b981" }}>{counts.approved}</div>
        </div>

        {/* Suspended Stores */}
        <div
          onClick={() => {
            setStatusFilter("suspended");
            setPage(1);
          }}
          style={{
            ...cardStyle,
            padding: "20px",
            cursor: "pointer",
            border: statusFilter === "suspended" ? "1px solid #ef4444" : "1px solid var(--card-border)",
            background:
              statusFilter === "suspended"
                ? "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.03))"
                : "var(--card-bg)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Suspended
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#ef444420",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
              }}
            >
              <Ban size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#ef4444" }}>{counts.suspended}</div>
        </div>

        {/* Total Vendors */}
        <div
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          style={{
            ...cardStyle,
            padding: "20px",
            cursor: "pointer",
            border: statusFilter === "all" ? "1px solid #8b5cf6" : "1px solid var(--card-border)",
            background:
              statusFilter === "all"
                ? "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.03))"
                : "var(--card-bg)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              All Vendors
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#8b5cf620",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8b5cf6",
              }}
            >
              <Store size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>{counts.all}</div>
        </div>
      </div>

      {/* ── Filter Pills & Search Bar ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Status Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Vendors", count: counts.all },
            { id: "pending", label: "Pending Approval", count: counts.pending, alert: counts.pending > 0 },
            { id: "approved", label: "Active Stores", count: counts.approved },
            { id: "rejected", label: "Rejected", count: counts.rejected },
            { id: "suspended", label: "Suspended", count: counts.suspended },
          ].map((item) => {
            const active = statusFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setStatusFilter(item.id);
                  setPage(1);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "20px",
                  border: active ? "1px solid #8b5cf6" : "1px solid var(--border-color)",
                  background: active ? "linear-gradient(135deg, #8b5cf625, #6366f125)" : "var(--bg-surface-alt)",
                  color: active ? "#a78bfa" : "var(--text-secondary)",
                  fontWeight: active ? 700 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span>{item.label}</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "1px 6px",
                    borderRadius: "10px",
                    background: item.alert ? "#f59e0b" : active ? "#8b5cf644" : "var(--border-color)",
                    color: item.alert ? "#fff" : active ? "#fff" : "var(--text-muted)",
                  }}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <div style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "420px", minWidth: "260px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                pointerEvents: "none",
              }}
            />
            <input
              id="vendor-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by store, name, email, GST..."
              style={inputWithIcon}
            />
          </div>
          <button onClick={load} style={iconBtn} title="Refresh Vendor List">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* ── Vendors Table ── */}
      {loading ? (
        <Spinner />
      ) : (
        <div
          style={{
            overflowX: "auto",
            background: "var(--card-bg)",
            borderRadius: "16px",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Vendor & Owner", "Store Details", "Store Status", "KYC & Documents", "Catalog / Sales", "Actions"].map(
                  (h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <Store size={36} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                      <span style={{ fontSize: "15px", fontWeight: 600 }}>No vendors found</span>
                      <span style={{ fontSize: "13px" }}>
                        {statusFilter !== "all"
                          ? `No vendors matching filter "${statusFilter}"`
                          : "No vendors registered yet"}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                vendors.map((v) => {
                  const isPending = v.vendorStatus === "pending";
                  const isSuspended = v.vendorStatus === "suspended";
                  const isRejected = v.vendorStatus === "rejected";
                  const isApproved = v.vendorStatus === "approved" || v.storeStatus === "active";

                  return (
                    <tr
                      key={v._id}
                      style={{
                        background: isPending ? "rgba(245, 158, 11, 0.03)" : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Vendor & Owner info */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "12px",
                              background: isPending
                                ? "#f59e0b22"
                                : isApproved
                                ? "#10b98122"
                                : isSuspended
                                ? "#ef444422"
                                : "#8b5cf622",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontWeight: 800,
                              color: isPending
                                ? "#f59e0b"
                                : isApproved
                                ? "#10b981"
                                : isSuspended
                                ? "#ef4444"
                                : "#8b5cf6",
                              fontSize: "15px",
                            }}
                          >
                            {v.name?.[0]?.toUpperCase() || "V"}
                          </div>
                          <div>
                            <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px" }}>
                              {v.name}
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{v.email}</div>
                            {v.phone && (
                              <div style={{ color: "var(--text-secondary)", fontSize: "11px", marginTop: "2px" }}>
                                {v.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Store Details */}
                      <td style={tdStyle}>
                        <div>
                          <div
                            style={{
                              color: "var(--text-primary)",
                              fontWeight: 700,
                              fontSize: "13.5px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Store size={14} color="#8b5cf6" />
                            <span>{v.storeName || "Store Name Pending"}</span>
                          </div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "11.5px", marginTop: "2px" }}>
                            {v.businessType || "Individual"}
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                            Joined {formatDate(v.createdAt)}
                          </div>
                        </div>
                      </td>

                      {/* Store Status */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <StoreStatusBadge status={v.storeStatus || v.vendorStatus} />
                          {isRejected && v.rejectionReason && (
                            <span
                              style={{
                                color: "#ef4444",
                                fontSize: "10.5px",
                                maxWidth: "160px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={v.rejectionReason}
                            >
                              Reason: {v.rejectionReason}
                            </span>
                          )}
                          {isSuspended && v.suspensionReason && (
                            <span
                              style={{
                                color: "#ef4444",
                                fontSize: "10.5px",
                                maxWidth: "160px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={v.suspensionReason}
                            >
                              Reason: {v.suspensionReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* KYC & Documents */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                          <DocPill vendor={v} />
                          {v.gstNumber && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--text-secondary)",
                                fontFamily: "monospace",
                                background: "var(--bg-surface-alt)",
                                padding: "1px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              GST: {v.gstNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Performance */}
                      <td style={tdStyle}>
                        <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Products: </span>
                            <span style={{ color: "#a78bfa", fontWeight: 700 }}>{v.productCount}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Orders: </span>
                            <span style={{ color: "#60a5fa", fontWeight: 700 }}>{v.totalOrders}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Sales: </span>
                            <span style={{ color: "#10b981", fontWeight: 700 }}>{formatRupees(v.earnings)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          {/* Review & Verify modal button */}
                          <button
                            onClick={() => setSelectedVendor(v)}
                            title="Verify Documents & Store Profile"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid #8b5cf644",
                              background: "#8b5cf618",
                              color: "#8b5cf6",
                              fontSize: "12px",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            <Eye size={13} />
                            <span>Verify</span>
                          </button>

                          {/* Quick Approve (if not approved) */}
                          {!isApproved && (
                            <ActionBtn
                              color="#10b981"
                              title="Approve Vendor"
                              onClick={() => handleQuickApprove(v)}
                            >
                              <ShieldCheck size={14} />
                            </ActionBtn>
                          )}

                          {/* Quick Reject (if pending) */}
                          {isPending && (
                            <ActionBtn
                              color="#ef4444"
                              title="Reject Vendor Application"
                              onClick={() => setActionModal({ type: "reject", vendor: v, reason: "" })}
                            >
                              <ShieldX size={14} />
                            </ActionBtn>
                          )}

                          {/* Suspend or Reactivate */}
                          {isApproved && (
                            <ActionBtn
                              color="#f59e0b"
                              title="Suspend Vendor Store"
                              onClick={() => setActionModal({ type: "suspend", vendor: v, reason: "" })}
                            >
                              <Ban size={14} />
                            </ActionBtn>
                          )}

                          {isSuspended && (
                            <ActionBtn
                              color="#10b981"
                              title="Reactivate Vendor Store"
                              onClick={() => handleQuickReactivate(v)}
                            >
                              <CheckCircle2 size={14} />
                            </ActionBtn>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && <Pagination page={page} pages={pages} setPage={setPage} />}

      {/* ── Document Verification & Store Review Modal ── */}
      {selectedVendor && (
        <div style={overlay}>
          <div
            style={{
              ...modal,
              maxWidth: "680px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {selectedVendor.storeName || selectedVendor.name}
                  </h3>
                  <StoreStatusBadge status={selectedVendor.storeStatus || selectedVendor.vendorStatus} />
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                  Vendor Verification & KYC Audit Dossier
                </p>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Vendor Owner & Contact Profile */}
            <div
              style={{
                background: "var(--bg-surface-alt)",
                borderRadius: "14px",
                padding: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                border: "1px solid var(--border-color)",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Account Owner
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedVendor.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {selectedVendor.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Phone & Contact
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedVendor.phone || "Not provided"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Registered {formatDateTime(selectedVendor.createdAt)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Business Structure
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {selectedVendor.businessType || "Individual / Sole Proprietor"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Registered Address
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px", lineHeight: 1.4 }}>
                  {selectedVendor.businessAddress || "Address not provided"}
                </div>
              </div>
            </div>

            {/* Tax & Business Identification Numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* GST Number */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  background: "var(--card-bg)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  GSTIN Number
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: selectedVendor.gstNumber ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    {selectedVendor.gstNumber || "Not Provided"}
                  </span>
                  {selectedVendor.gstNumber && (
                    <button
                      onClick={() => handleCopy(selectedVendor.gstNumber, "gst")}
                      style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", padding: "2px" }}
                      title="Copy GST"
                    >
                      {copiedKey === "gst" ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* PAN Number */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  background: "var(--card-bg)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Business PAN
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: selectedVendor.panNumber ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    {selectedVendor.panNumber || "Not Provided"}
                  </span>
                  {selectedVendor.panNumber && (
                    <button
                      onClick={() => handleCopy(selectedVendor.panNumber, "pan")}
                      style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", padding: "2px" }}
                      title="Copy PAN"
                    >
                      {copiedKey === "pan" ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Document Verification Section */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={16} color="#8b5cf6" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    Uploaded Documents & Proofs
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleDocVerify(selectedVendor._id, "verified")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid #10b98144",
                      background: selectedVendor.documentVerificationStatus === "verified" ? "#10b981" : "#10b98115",
                      color: selectedVendor.documentVerificationStatus === "verified" ? "#fff" : "#10b981",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Mark Verified
                  </button>
                  <button
                    onClick={() => handleDocVerify(selectedVendor._id, "rejected")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid #ef444444",
                      background: selectedVendor.documentVerificationStatus === "rejected" ? "#ef4444" : "#ef444415",
                      color: selectedVendor.documentVerificationStatus === "rejected" ? "#fff" : "#ef4444",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Mark Incomplete
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {/* Business Registration / GST Certificate */}
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    background: "var(--card-bg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                      Business Certificate
                    </span>
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
                      {selectedVendor.businessDocType || "GST / Trade License"}
                    </span>
                  </div>

                  {selectedVendor.businessDocUrl ? (
                    <div>
                      {selectedVendor.businessDocUrl.match(/\.(jpeg|jpg|png|webp|svg)/i) ? (
                        <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", height: "100px", border: "1px solid var(--border-color)", marginBottom: "8px" }}>
                          <img
                            src={selectedVendor.businessDocUrl}
                            alt="Business Certificate"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            height: "60px",
                            borderRadius: "8px",
                            background: "var(--bg-surface-alt)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            color: "var(--text-secondary)",
                            fontSize: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <FileText size={20} color="#8b5cf6" />
                          <span>PDF Document Attached</span>
                        </div>
                      )}
                      <a
                        href={selectedVendor.businessDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#8b5cf6",
                          textDecoration: "none",
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>View / Open Document</span>
                      </a>
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "10px 0" }}>
                      No business certificate attached yet
                    </div>
                  )}
                </div>

                {/* Identity Proof */}
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    background: "var(--card-bg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                      Identity Proof
                    </span>
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
                      {selectedVendor.idProofType || "Govt ID"}
                    </span>
                  </div>

                  {selectedVendor.idProofUrl ? (
                    <div>
                      {selectedVendor.idProofUrl.match(/\.(jpeg|jpg|png|webp|svg)/i) ? (
                        <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", height: "100px", border: "1px solid var(--border-color)", marginBottom: "8px" }}>
                          <img
                            src={selectedVendor.idProofUrl}
                            alt="Identity Proof"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            height: "60px",
                            borderRadius: "8px",
                            background: "var(--bg-surface-alt)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            color: "var(--text-secondary)",
                            fontSize: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <FileText size={20} color="#8b5cf6" />
                          <span>PDF Document Attached</span>
                        </div>
                      )}
                      <a
                        href={selectedVendor.idProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#8b5cf6",
                          textDecoration: "none",
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>View / Open Document</span>
                      </a>
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "10px 0" }}>
                      No ID proof attached yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection / Suspension Status Notes (if any) */}
            {(selectedVendor.rejectionReason || selectedVendor.suspensionReason) && (
              <div
                style={{
                  background: "#ef444412",
                  border: "1px solid #ef444433",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  fontSize: "12.5px",
                  color: "#ef4444",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "3px" }}>
                  {selectedVendor.vendorStatus === "suspended"
                    ? "Suspension Reason:"
                    : "Rejection Reason:"}
                </div>
                <div>{selectedVendor.suspensionReason || selectedVendor.rejectionReason}</div>
              </div>
            )}

            {/* Store Status Control Selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "var(--bg-surface-alt)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Change Store Status:
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                  Controls vendor selling privileges directly
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { id: "active", label: "Active", color: "#10b981" },
                  { id: "pending_approval", label: "Pending", color: "#f59e0b" },
                  { id: "suspended", label: "Suspended", color: "#ef4444" },
                  { id: "rejected", label: "Rejected", color: "#64748b" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStoreStatusChange(selectedVendor._id, s.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border:
                        selectedVendor.storeStatus === s.id
                          ? `1px solid ${s.color}`
                          : "1px solid var(--border-color)",
                      background: selectedVendor.storeStatus === s.id ? `${s.color}22` : "transparent",
                      color: selectedVendor.storeStatus === s.id ? s.color : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: selectedVendor.storeStatus === s.id ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer Direct Decisions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                paddingTop: "14px",
                borderTop: "1px solid var(--border-color)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                {selectedVendor.storeStatus !== "active" && (
                  <button
                    onClick={() => handleQuickApprove(selectedVendor)}
                    style={{
                      ...primaryBtn,
                      background: "linear-gradient(135deg, #10b981, #059669)",
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Approve & Activate Store</span>
                  </button>
                )}

                {selectedVendor.storeStatus === "active" && (
                  <button
                    onClick={() => setActionModal({ type: "suspend", vendor: selectedVendor, reason: "" })}
                    style={{
                      ...primaryBtn,
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    }}
                  >
                    <Ban size={16} />
                    <span>Suspend Store</span>
                  </button>
                )}

                {selectedVendor.storeStatus !== "rejected" && selectedVendor.storeStatus !== "active" && (
                  <button
                    onClick={() => setActionModal({ type: "reject", vendor: selectedVendor, reason: "" })}
                    style={{
                      ...cancelBtn,
                      color: "#ef4444",
                      borderColor: "#ef444444",
                    }}
                  >
                    <ShieldX size={15} />
                    <span>Reject Application</span>
                  </button>
                )}
              </div>

              <button onClick={() => setSelectedVendor(null)} style={cancelBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject or Suspend Reason Prompt Modal ── */}
      {actionModal && (
        <div style={overlay}>
          <div
            style={{
              ...modal,
              maxWidth: "460px",
              padding: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: actionModal.type === "reject" ? "#ef444420" : "#f59e0b20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: actionModal.type === "reject" ? "#ef4444" : "#f59e0b",
                }}
              >
                {actionModal.type === "reject" ? <ShieldX size={20} /> : <Ban size={20} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {actionModal.type === "reject" ? "Reject Vendor Registration" : "Suspend Vendor Store"}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                  {actionModal.vendor?.storeName || actionModal.vendor?.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleActionSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  {actionModal.type === "reject" ? "Rejection Reason / Feedback" : "Suspension Reason"}
                </label>
                <textarea
                  required
                  rows={4}
                  value={actionModal.reason}
                  onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                  placeholder={
                    actionModal.type === "reject"
                      ? "e.g. Document image is illegible / GST registration certificate does not match vendor name."
                      : "e.g. Policy violation / Repeated unfulfilled customer orders / Under review."
                  }
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                  }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  This reason will be displayed in the vendor's dashboard so they understand the action.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  style={cancelBtn}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    ...primaryBtn,
                    background:
                      actionModal.type === "reject"
                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                        : "linear-gradient(135deg, #f59e0b, #d97706)",
                  }}
                >
                  {actionLoading
                    ? "Processing..."
                    : actionModal.type === "reject"
                    ? "Confirm Rejection"
                    : "Confirm Suspension"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
