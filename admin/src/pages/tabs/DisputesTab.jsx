import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  Eye,
  HelpCircle,
  LifeBuoy,
  Loader2,
  Mail,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  Store,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  apiCreateTicket,
  apiDeleteTicket,
  apiGetTickets,
  apiUpdateTicket,
} from "../../api";
import {
  ActionBtn,
  Badge,
  Pagination,
  Spinner,
  cancelBtn,
  iconBtn,
  inputStyle,
  inputWithIcon,
  modal,
  overlay,
  primaryBtn,
  selectStyle,
  tableStyle,
  tdStyle,
  thStyle,
} from "../../components/UI";

const CATEGORY_CONFIG = {
  order: { label: "Order Issue", color: "#6366f1", icon: Package },
  payment: { label: "Payment Issue", color: "#f59e0b", icon: CreditCard },
  customer: { label: "Customer Dispute", color: "#ec4899", icon: AlertTriangle },
  vendor: { label: "Vendor Issue", color: "#8b5cf6", icon: Store },
  product: { label: "Product Issue", color: "#06b6d4", icon: Tag },
  general: { label: "General Support", color: "#6b7280", icon: HelpCircle },
};

const STATUS_CONFIG = {
  open: { label: "Open", color: "#ef4444" },
  in_progress: { label: "In Progress", color: "#f59e0b" },
  resolved: { label: "Resolved", color: "#10b981" },
  closed: { label: "Closed", color: "#6b7280" },
};

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", color: "#ef4444" },
  high: { label: "High", color: "#f97316" },
  medium: { label: "Medium", color: "#3b82f6" },
  low: { label: "Low", color: "#6b7280" },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const labelStyle = {
  display: "block",
  color: "var(--text-secondary)",
  fontSize: "11px",
  fontWeight: 600,
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export default function DisputesTab({ showToast, showConfirm, refreshOpenCount }) {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Resolve form
  const [resolveForm, setResolveForm] = useState({
    status: "open",
    priority: "medium",
    adminNotes: "",
    adminReply: "",
  });
  const [savingResolution, setSavingResolution] = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "order",
    subject: "",
    description: "",
    orderId: "",
    paymentId: "",
    priority: "medium",
  });
  const [creatingTicket, setCreatingTicket] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append("search", search);
      if (statusFilter) p.append("status", statusFilter);
      if (categoryFilter) p.append("category", categoryFilter);
      if (priorityFilter) p.append("priority", priorityFilter);
      p.append("page", page);
      p.append("limit", 15);

      const res = await apiGetTickets(p.toString());
      setTickets(res.data?.tickets || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
      if (res.data?.counts) setCounts(res.data.counts);
      if (res.data?.categories) setCategoryCounts(res.data.categories);
      if (refreshOpenCount) refreshOpenCount();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [
    search,
    statusFilter,
    categoryFilter,
    priorityFilter,
    page,
    showToast,
    refreshOpenCount,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const openResolveModal = (ticket) => {
    setSelectedTicket(ticket);
    setResolveForm({
      status: ticket.status || "open",
      priority: ticket.priority || "medium",
      adminNotes: ticket.adminNotes || "",
      adminReply: ticket.adminReply || "",
    });
    setResolveModalOpen(true);
  };

  const handleSaveResolution = async () => {
    if (!selectedTicket) return;
    setSavingResolution(true);
    try {
      await apiUpdateTicket(selectedTicket._id, resolveForm);
      showToast(
        resolveForm.status === "resolved"
          ? "Ticket resolved successfully!"
          : "Ticket updated successfully!"
      );
      setResolveModalOpen(false);
      load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSavingResolution(false);
    }
  };

  const handleQuickResolve = async (ticket) => {
    try {
      await apiUpdateTicket(ticket._id, {
        status: "resolved",
        adminReply:
          ticket.adminReply ||
          "Issue has been reviewed and resolved by ShivraTech support.",
      });
      showToast(`Ticket ${ticket.ticketId} marked as resolved!`);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleDelete = (ticket) => {
    showConfirm(
      `Delete ticket ${ticket.ticketId} (${ticket.subject})? This action cannot be undone.`,
      async () => {
        try {
          await apiDeleteTicket(ticket._id);
          showToast("Ticket deleted.");
          load();
        } catch (e) {
          showToast(e.message, "error");
        }
      }
    );
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!createForm.subject.trim() || !createForm.description.trim()) {
      showToast("Please provide subject and description", "error");
      return;
    }
    if (!createForm.email.trim()) {
      showToast("Email address is required", "error");
      return;
    }
    setCreatingTicket(true);
    try {
      const res = await apiCreateTicket(createForm);
      showToast(`Dispute ticket ${res.data?.ticketId || ""} raised successfully!`);
      setCreateModalOpen(false);
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        category: "order",
        subject: "",
        description: "",
        orderId: "",
        paymentId: "",
        priority: "medium",
      });
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCreatingTicket(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── Top Header & Stats Cards ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: 0,
            }}
          >
            <LifeBuoy size={24} color="#6366f1" />
            Support & Disputes
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "13px",
              margin: "4px 0 0 0",
            }}
          >
            Manage customer complaints, payment escalations, order disputes, and vendor mediation
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          style={{
            ...primaryBtn,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          }}
        >
          <Plus size={16} />
          <span>+ Raise / Log Dispute</span>
        </button>
      </div>

      {/* ── Metrics Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
              }}
            >
              Total Tickets
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#6366f120",
                color: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LifeBuoy size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800 }}>{counts.total}</div>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            Lifetime customer & vendor tickets
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid #ef444440",
            borderRadius: "16px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#ef4444",
                textTransform: "uppercase",
              }}
            >
              Open Issues
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#ef444420",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#ef4444" }}>
            {counts.open}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            Requiring immediate admin attention
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#f59e0b",
                textTransform: "uppercase",
              }}
            >
              In Progress
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#f59e0b20",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b" }}>
            {counts.in_progress}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            Under investigation / active review
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#10b981",
                textTransform: "uppercase",
              }}
            >
              Resolved
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#10b98120",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#10b981" }}>
            {counts.resolved + counts.closed}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            Completed and closed cases
          </span>
        </div>
      </div>

      {/* ── Category Breakdown Pills ── */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          padding: "10px 14px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginRight: "4px",
          }}
        >
          Categories:
        </span>
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
          const count = categoryCounts[key] || 0;
          const isSelected = categoryFilter === key;
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => {
                setCategoryFilter(isSelected ? "" : key);
                setPage(1);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "20px",
                border: `1px solid ${isSelected ? cfg.color : "var(--border-color)"}`,
                background: isSelected ? `${cfg.color}20` : "var(--bg-surface-alt)",
                color: isSelected ? cfg.color : "var(--text-primary)",
                fontSize: "11.5px",
                fontWeight: isSelected ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icon size={13} color={cfg.color} />
              <span>{cfg.label}</span>
              <span
                style={{
                  background: isSelected ? cfg.color : "var(--border-color)",
                  color: isSelected ? "#fff" : "var(--text-secondary)",
                  borderRadius: "10px",
                  padding: "0 6px",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search & Filter Controls ── */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
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
            id="ticket-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Ticket ID, Customer/Vendor, Order ID, Payment Ref..."
            style={inputWithIcon}
          />
        </div>

        <select
          id="ticket-status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          id="ticket-priority-filter"
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setPage(1);
          }}
          style={selectStyle}
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button
          onClick={load}
          title="Refresh"
          style={iconBtn}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* ── Tickets Table ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Spinner />
        ) : tickets.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <LifeBuoy size={42} style={{ opacity: 0.3 }} />
            <div style={{ fontSize: "16px", fontWeight: 700 }}>
              No support tickets or disputes found
            </div>
            <p style={{ fontSize: "13px", maxWidth: "400px", margin: 0 }}>
              {search || statusFilter || categoryFilter
                ? "Try adjusting your search filters to find tickets."
                : "No customer or order issues have been reported. All systems are operating smoothly."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Ticket ID</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Subject & Issue</th>
                  <th style={thStyle}>Raised By</th>
                  <th style={thStyle}>Linked Ref</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Created</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const catCfg =
                    CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.general;
                  const statCfg =
                    STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                  const prioCfg =
                    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
                  const CatIcon = catCfg.icon;

                  return (
                    <tr
                      key={ticket._id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--bg-surface-alt)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Ticket ID */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "var(--text-primary)",
                            fontSize: "12.5px",
                            fontFamily: "monospace",
                          }}
                        >
                          {ticket.ticketId}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: `${catCfg.color}15`,
                            color: catCfg.color,
                            border: `1px solid ${catCfg.color}35`,
                            borderRadius: "6px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          <CatIcon size={12} />
                          {catCfg.label}
                        </span>
                      </td>

                      {/* Subject & Summary */}
                      <td style={{ ...tdStyle, maxWidth: "260px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={ticket.subject}
                        >
                          {ticket.subject}
                        </div>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "var(--text-secondary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: "2px",
                          }}
                          title={ticket.description}
                        >
                          {ticket.description}
                        </div>
                      </td>

                      {/* Raised By */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontSize: "12.5px",
                          }}
                        >
                          {ticket.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {ticket.email}
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "3px",
                            fontSize: "9.5px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            background:
                              ticket.userRole === "seller"
                                ? "#8b5cf620"
                                : ticket.userRole === "customer"
                                ? "#3b82f620"
                                : "#6b728020",
                            color:
                              ticket.userRole === "seller"
                                ? "#8b5cf6"
                                : ticket.userRole === "customer"
                                ? "#3b82f6"
                                : "#6b7280",
                          }}
                        >
                          {ticket.userRole}
                        </span>
                      </td>

                      {/* Linked Reference */}
                      <td style={tdStyle}>
                        {ticket.orderId ? (
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: "11.5px",
                              color: "#6366f1",
                              fontWeight: 700,
                              background: "#6366f115",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              display: "inline-block",
                            }}
                          >
                            {ticket.orderId}
                          </div>
                        ) : ticket.paymentId ? (
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: "11px",
                              color: "#f59e0b",
                              fontWeight: 600,
                              background: "#f59e0b15",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              display: "inline-block",
                            }}
                          >
                            {ticket.paymentId}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                            —
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: prioCfg.color,
                            background: `${prioCfg.color}15`,
                            border: `1px solid ${prioCfg.color}30`,
                            borderRadius: "6px",
                            padding: "2px 7px",
                          }}
                        >
                          {prioCfg.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <Badge color={statCfg.color}>{statCfg.label}</Badge>
                      </td>

                      {/* Created */}
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: "11.5px",
                          color: "var(--text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(ticket.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px",
                          }}
                        >
                          <ActionBtn
                            color="#6366f1"
                            title="Inspect & Resolve Dispute"
                            onClick={() => openResolveModal(ticket)}
                          >
                            <Edit2 size={15} />
                          </ActionBtn>

                          {ticket.status !== "resolved" && (
                            <ActionBtn
                              color="#10b981"
                              title="Quick Mark Resolved"
                              onClick={() => handleQuickResolve(ticket)}
                            >
                              <CheckCircle2 size={15} />
                            </ActionBtn>
                          )}

                          <ActionBtn
                            color="#ef4444"
                            title="Delete Ticket"
                            onClick={() => handleDelete(ticket)}
                          >
                            <Trash2 size={15} />
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {pages > 1 && (
          <div style={{ padding: "16px 20px" }}>
            <Pagination page={page} pages={pages} setPage={setPage} />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ── MODAL 1: VIEW & RESOLVE DISPUTE TICKET                                ── */}
      {/* ========================================================================= */}
      {resolveModalOpen && selectedTicket && (
        <div style={overlay}>
          <div
            style={{
              ...modal,
              maxWidth: "680px",
              padding: "28px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: "15px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedTicket.ticketId}
                  </span>
                  <Badge
                    color={
                      STATUS_CONFIG[selectedTicket.status]?.color || "#ef4444"
                    }
                  >
                    {selectedTicket.status}
                  </Badge>
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    margin: "6px 0 0 0",
                  }}
                >
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setResolveModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Ticket Info Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                background: "var(--bg-surface-alt)",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid var(--border-subtle)",
                marginBottom: "20px",
              }}
            >
              <div>
                <span style={labelStyle}>Raised By</span>
                <div style={{ fontWeight: 700, fontSize: "13px" }}>
                  {selectedTicket.name} ({selectedTicket.userRole})
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {selectedTicket.email}
                </div>
                {selectedTicket.phone && (
                  <div style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>
                    Phone: {selectedTicket.phone}
                  </div>
                )}
              </div>

              <div>
                <span style={labelStyle}>Category & Priority</span>
                <div style={{ fontSize: "12.5px", fontWeight: 700 }}>
                  {CATEGORY_CONFIG[selectedTicket.category]?.label ||
                    selectedTicket.category}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color:
                      PRIORITY_CONFIG[selectedTicket.priority]?.color ||
                      "#3b82f6",
                    marginTop: "2px",
                  }}
                >
                  Priority: {selectedTicket.priority}
                </div>
              </div>

              <div>
                <span style={labelStyle}>References</span>
                {selectedTicket.orderId ? (
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#6366f1" }}>
                    Order: {selectedTicket.orderId}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    No linked order
                  </div>
                )}
                {selectedTicket.paymentId && (
                  <div style={{ fontSize: "11.5px", color: "#f59e0b", marginTop: "2px" }}>
                    Payment ID: {selectedTicket.paymentId}
                  </div>
                )}
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Created: {formatDate(selectedTicket.createdAt)}
                </div>
              </div>
            </div>

            {/* Description Box */}
            <div style={{ marginBottom: "20px" }}>
              <span style={labelStyle}>Detailed Issue Description</span>
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedTicket.description}
              </div>
            </div>

            {/* Admin Controls */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Update Status</label>
                <select
                  value={resolveForm.status}
                  onChange={(e) =>
                    setResolveForm({ ...resolveForm, status: e.target.value })
                  }
                  style={{ ...selectStyle, width: "100%" }}
                >
                  <option value="open">Open (Unresolved)</option>
                  <option value="in_progress">In Progress (Investigating)</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Update Priority</label>
                <select
                  value={resolveForm.priority}
                  onChange={(e) =>
                    setResolveForm({ ...resolveForm, priority: e.target.value })
                  }
                  style={{ ...selectStyle, width: "100%" }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Admin Reply / Resolution to User */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>
                Admin Reply / Resolution Message (Customer / Vendor visible)
              </label>
              <textarea
                value={resolveForm.adminReply}
                onChange={(e) =>
                  setResolveForm({ ...resolveForm, adminReply: e.target.value })
                }
                rows={3}
                placeholder="Type resolution statement or updates sent to the user/vendor..."
                style={{
                  ...inputStyle,
                  width: "100%",
                  resize: "vertical",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Internal Admin Notes */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Internal Admin Notes (Private)</label>
              <textarea
                value={resolveForm.adminNotes}
                onChange={(e) =>
                  setResolveForm({ ...resolveForm, adminNotes: e.target.value })
                }
                rows={2}
                placeholder="Internal investigation notes, refund txn ids, courier escalation refs..."
                style={{
                  ...inputStyle,
                  width: "100%",
                  resize: "vertical",
                  fontSize: "12px",
                }}
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                {resolveForm.status !== "resolved" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResolveForm({
                        ...resolveForm,
                        status: "resolved",
                        adminReply:
                          resolveForm.adminReply ||
                          "Issue reviewed and resolved by ShivraTech Support.",
                      });
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: "1px solid #10b981",
                      background: "#10b98115",
                      color: "#10b981",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Quick Mark Resolved
                  </button>
                )}
                {resolveForm.status === "open" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResolveForm({ ...resolveForm, status: "in_progress" });
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: "1px solid #f59e0b",
                      background: "#f59e0b15",
                      color: "#f59e0b",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Mark In Progress
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  style={cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingResolution}
                  onClick={handleSaveResolution}
                  style={{
                    ...primaryBtn,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {savingResolution && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  <span>Save Resolution</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── MODAL 2: RAISE / LOG NEW DISPUTE TICKET (ADMIN CREATION)               ── */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth: "560px", padding: "28px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "14px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Plus size={18} color="#6366f1" />
                Raise / Log Support Dispute
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateTicket}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, category: e.target.value })
                    }
                    style={{ ...selectStyle, width: "100%" }}
                  >
                    <option value="order">Order Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="customer">Customer Dispute</option>
                    <option value="vendor">Vendor Issue</option>
                    <option value="product">Product Issue</option>
                    <option value="general">General Support</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Priority *</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, priority: e.target.value })
                    }
                    style={{ ...selectStyle, width: "100%" }}
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Subject / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Double payment deduction or damaged robot delivery"
                  value={createForm.subject}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, subject: e.target.value })
                  }
                  style={{ ...inputStyle, width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Reporter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Customer / Vendor name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    style={{ ...inputStyle, width: "100%" }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Reporter Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="customer@example.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    style={{ ...inputStyle, width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Linked Order ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ST-889124"
                    value={createForm.orderId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, orderId: e.target.value })
                    }
                    style={{ ...inputStyle, width: "100%", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Payment Ref / ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. pay_rzp_... or UPI ref"
                    value={createForm.paymentId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, paymentId: e.target.value })
                    }
                    style={{ ...inputStyle, width: "100%", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Detailed Problem Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide all facts, customer claims, tracking status, or payment discrepancies..."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    width: "100%",
                    resize: "vertical",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  style={{
                    ...primaryBtn,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                >
                  {creatingTicket && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  <span>Create Dispute Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
