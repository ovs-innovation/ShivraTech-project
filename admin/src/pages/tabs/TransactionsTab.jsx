import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Filter,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Search,
  Sliders,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  apiGetTransactions,
  apiGetTransactionById,
  apiRefundTransaction,
  apiUpdateTransactionStatus,
} from "../../api";
import {
  ActionBtn,
  Badge,
  Pagination,
  Spinner,
  cardStyle,
  iconBtn,
  inputStyle,
  inputWithIcon,
  modal,
  overlay,
  primaryBtn,
  cancelBtn,
  selectStyle,
  tableStyle,
  tdStyle,
  thStyle,
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
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const GATEWAY_STATUS_CONFIG = {
  captured: { label: "Captured", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "#10b98144" },
  authorized: { label: "Authorized", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "#3b82f644" },
  failed: { label: "Failed", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "#ef444444" },
  refunded: { label: "Refunded", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)", border: "#8b5cf644" },
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "#f59e0b44" },
};

const PAYMENT_STATUS_COLORS = {
  Paid: "#10b981",
  Failed: "#ef4444",
  Refunded: "#8b5cf6",
  Pending: "#f59e0b",
};

const labelStyle = {
  display: "block",
  color: "var(--text-secondary)",
  fontSize: "11px",
  fontWeight: 600,
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export default function TransactionsTab({ showToast, showConfirm }) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    paidCount: 0,
    failedCount: 0,
    refundedCount: 0,
    pendingCount: 0,
    totalRevenue: 0,
    totalRefunded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refundModalTx, setRefundModalTx] = useState(null);
  const [statusModalTx, setStatusModalTx] = useState(null);

  // Refund Form State
  const [refundForm, setRefundForm] = useState({ amount: "", reason: "" });
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Status Form State
  const [statusForm, setStatusForm] = useState({
    paymentStatus: "",
    gatewayStatus: "",
    failureReason: "",
  });
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append("search", search);
      if (statusFilter !== "all") p.append("status", statusFilter);
      if (gatewayFilter !== "all") p.append("gateway", gatewayFilter);
      p.append("page", page);
      p.append("limit", 15);

      const res = await apiGetTransactions(p.toString());
      setTransactions(res.data?.transactions || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, gatewayFilter, page, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const copyToClipboard = (text, label = "Payment ID") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleOpenDetail = async (txId) => {
    setDetailLoading(true);
    try {
      const res = await apiGetTransactionById(txId);
      setSelectedTx(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenRefund = (tx) => {
    setRefundModalTx(tx);
    setRefundForm({
      amount: tx.totalAmount || "",
      reason: "Customer requested cancellation / refund",
    });
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    if (!refundModalTx) return;
    setRefundSubmitting(true);
    try {
      await apiRefundTransaction(refundModalTx._id, refundForm);
      showToast(`Refund of ₹${refundForm.amount || refundModalTx.totalAmount} processed successfully`);
      setRefundModalTx(null);
      if (selectedTx && selectedTx._id === refundModalTx._id) {
        handleOpenDetail(refundModalTx._id);
      }
      fetchTransactions();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleOpenStatusModal = (tx) => {
    setStatusModalTx(tx);
    setStatusForm({
      paymentStatus: tx.paymentStatus || "Pending",
      gatewayStatus: tx.gatewayStatus || "pending",
      failureReason: tx.failureReason || "",
    });
  };

  const submitStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModalTx) return;
    setStatusSubmitting(true);
    try {
      await apiUpdateTransactionStatus(statusModalTx._id, statusForm);
      showToast("Transaction status updated successfully");
      setStatusModalTx(null);
      if (selectedTx && selectedTx._id === statusModalTx._id) {
        handleOpenDetail(statusModalTx._id);
      }
      fetchTransactions();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setStatusSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── KPI Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Total Captured / Paid */}
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderLeft: "4px solid #10b981",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
              Successful / Paid
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {formatRupees(stats.totalRevenue)}
            </div>
            <div style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, marginTop: "2px" }}>
              {stats.paidCount} transactions captured
            </div>
          </div>
        </div>

        {/* Failed Payments */}
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderLeft: "4px solid #ef4444",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
              Failed Payments
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ef4444", marginTop: "2px" }}>
              {stats.failedCount} Failed
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Requires attention / retry
            </div>
          </div>
        </div>

        {/* Refunded Payments */}
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderLeft: "4px solid #8b5cf6",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "rgba(139, 92, 246, 0.12)",
              color: "#8b5cf6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <RotateCcw size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
              Refunded Volume
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {formatRupees(stats.totalRefunded)}
            </div>
            <div style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: 600, marginTop: "2px" }}>
              {stats.refundedCount} transactions refunded
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "rgba(245, 158, 11, 0.12)",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
              Pending / COD
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {stats.pendingCount} Pending
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Awaiting confirmation/delivery
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div style={{ ...cardStyle, padding: "18px 22px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Status Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {[
              { id: "all", label: "All Transactions", count: stats.totalCount },
              { id: "paid", label: "Paid / Captured", count: stats.paidCount, color: "#10b981" },
              { id: "failed", label: "Failed", count: stats.failedCount, color: "#ef4444" },
              { id: "refunded", label: "Refunded", count: stats.refundedCount, color: "#8b5cf6" },
              { id: "pending", label: "Pending", count: stats.pendingCount, color: "#f59e0b" },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "10px",
                    border: active ? "1px solid #8b5cf6" : "1px solid var(--border-color)",
                    background: active ? "var(--nav-active-bg)" : "var(--bg-surface-alt)",
                    color: active ? "var(--nav-active-color)" : "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.15s",
                  }}
                >
                  {tab.color && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: tab.color,
                      }}
                    />
                  )}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "6px",
                        background: active ? "rgba(139, 92, 246, 0.2)" : "rgba(150, 150, 150, 0.15)",
                        color: active ? "#8b5cf6" : "var(--text-muted)",
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Gateway Filter Dropdown */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={gatewayFilter}
              onChange={(e) => {
                setGatewayFilter(e.target.value);
                setPage(1);
              }}
              style={selectStyle}
            >
              <option value="all">All Gateways</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Cash on Delivery">Cash on Delivery (COD)</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>

            <button
              onClick={fetchTransactions}
              style={iconBtn}
              title="Refresh Transactions"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>

        {/* Search input line */}
        <div style={{ marginTop: "14px", display: "flex", gap: "12px", alignItems: "center" }}>
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
              id="transaction-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Payment ID (pay_...), Order ID, Customer name, Email, or Refund ID..."
              style={inputWithIcon}
            />
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "13px", whiteSpace: "nowrap" }}>
            {total} records found
          </span>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      {loading ? (
        <Spinner />
      ) : (
        <div style={{ ...cardStyle, padding: "0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "var(--bg-surface-alt)" }}>
                  <th style={thStyle}>Payment ID</th>
                  <th style={thStyle}>Order / Customer</th>
                  <th style={thStyle}>Gateway & Method</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Gateway Status</th>
                  <th style={thStyle}>Payment Status</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        padding: "50px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <CreditCard size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                      <div style={{ fontSize: "16px", fontWeight: 600 }}>No transactions found</div>
                      <div style={{ fontSize: "13px", marginTop: "4px" }}>
                        Try clearing search filters or refreshing.
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const gStatus = GATEWAY_STATUS_CONFIG[tx.gatewayStatus] || {
                      label: tx.gatewayStatus || "unknown",
                      color: "#6b7280",
                      bg: "rgba(107, 114, 128, 0.12)",
                      border: "#6b728044",
                    };
                    const pStatusColor = PAYMENT_STATUS_COLORS[tx.paymentStatus] || "#6b7280";

                    return (
                      <tr
                        key={tx._id}
                        style={{
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--bg-surface-hover, rgba(255,255,255,0.02))";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Payment ID */}
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <code
                              style={{
                                fontFamily: "monospace",
                                fontSize: "12px",
                                fontWeight: 700,
                                background: "var(--bg-surface-alt)",
                                padding: "3px 7px",
                                borderRadius: "6px",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-color)",
                              }}
                            >
                              {tx.paymentId || "N/A"}
                            </code>
                            <button
                              onClick={() => copyToClipboard(tx.paymentId, "Payment ID")}
                              title="Copy Payment ID"
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                padding: "2px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                          {tx.refundId && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                color: "#8b5cf6",
                                marginTop: "4px",
                              }}
                            >
                              <RotateCcw size={11} />
                              <span style={{ fontFamily: "monospace" }}>{tx.refundId}</span>
                            </div>
                          )}
                        </td>

                        {/* Order & Customer */}
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {tx.customerName || tx.user?.name || "Guest Customer"}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {tx.customerEmail || tx.user?.email || "—"}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            Ref: #{tx.orderId || String(tx._id).slice(-8)}
                          </div>
                        </td>

                        {/* Gateway & Payment Method */}
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                              }}
                            >
                              {tx.gateway || "Razorpay"}
                            </span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {tx.paymentMethod || "Online"}
                          </div>
                        </td>

                        {/* Amount */}
                        <td style={tdStyle}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                            {formatRupees(tx.totalAmount)}
                          </div>
                          {tx.refundAmount > 0 && (
                            <div style={{ fontSize: "11px", color: "#8b5cf6", fontWeight: 600 }}>
                              - {formatRupees(tx.refundAmount)} (Refunded)
                            </div>
                          )}
                        </td>

                        {/* Gateway Status Badge */}
                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "3px 9px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background: gStatus.bg,
                              color: gStatus.color,
                              border: `1px solid ${gStatus.border}`,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: gStatus.color,
                              }}
                            />
                            {gStatus.label}
                          </span>
                          {tx.gatewayStatus === "failed" && tx.failureReason && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#ef4444",
                                marginTop: "3px",
                                maxWidth: "160px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={tx.failureReason}
                            >
                              {tx.failureReason}
                            </div>
                          )}
                        </td>

                        {/* Payment Status Badge */}
                        <td style={tdStyle}>
                          <Badge color={pStatusColor}>
                            {tx.paymentStatus || "Pending"}
                          </Badge>
                        </td>

                        {/* Date & Time */}
                        <td style={tdStyle}>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {formatDate(tx.createdAt)}
                          </div>
                          {tx.paidAt && (
                            <div style={{ fontSize: "10.5px", color: "#10b981", marginTop: "2px" }}>
                              Paid: {formatDate(tx.paidAt)}
                            </div>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            {/* View details */}
                            <ActionBtn
                              color="#6366f1"
                              title="View Transaction Details"
                              onClick={() => handleOpenDetail(tx._id)}
                            >
                              <Eye size={15} />
                            </ActionBtn>

                            {/* Issue Refund (enabled for Paid or partial refund) */}
                            {tx.paymentStatus === "Paid" && (
                              <ActionBtn
                                color="#8b5cf6"
                                title="Process Refund"
                                onClick={() => handleOpenRefund(tx)}
                              >
                                <RotateCcw size={15} />
                              </ActionBtn>
                            )}

                            {/* Status override */}
                            <ActionBtn
                              color="#f59e0b"
                              title="Update Status Manually"
                              onClick={() => handleOpenStatusModal(tx)}
                            >
                              <Sliders size={15} />
                            </ActionBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)" }}>
              <Pagination page={page} pages={pages} setPage={setPage} />
            </div>
          )}
        </div>
      )}

      {/* ── Transaction Details Modal ── */}
      {selectedTx && (
        <div style={overlay} onClick={() => setSelectedTx(null)}>
          <div
            style={{ ...modal, maxWidth: "680px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
                    Transaction Details
                  </h3>
                  <Badge color={PAYMENT_STATUS_COLORS[selectedTx.paymentStatus] || "#6b7280"}>
                    {selectedTx.paymentStatus}
                  </Badge>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "6px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Payment ID:
                  </span>
                  <code
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "#8b5cf6",
                    }}
                  >
                    {selectedTx.paymentId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(selectedTx.paymentId, "Payment ID")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: "var(--bg-surface-alt)",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <span style={labelStyle}>Amount Paid</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {formatRupees(selectedTx.totalAmount)}
                </span>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Currency: {selectedTx.currency || "INR"}
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-surface-alt)",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <span style={labelStyle}>Gateway Status</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      textTransform: "capitalize",
                      color: GATEWAY_STATUS_CONFIG[selectedTx.gatewayStatus]?.color || "var(--text-primary)",
                    }}
                  >
                    {selectedTx.gatewayStatus}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Gateway: {selectedTx.gateway || "Razorpay"}
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg-surface-alt)",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <span style={labelStyle}>Order ID</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  #{selectedTx.orderId || String(selectedTx._id).slice(-8)}
                </span>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Method: {selectedTx.paymentMethod || "Online"}
                </div>
              </div>
            </div>

            {/* Failure Alert (if failed) */}
            {selectedTx.paymentStatus === "Failed" && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid #ef444444",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "20px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle size={20} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ color: "#ef4444", fontWeight: 700, fontSize: "13px" }}>
                    Payment Failure Details
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {selectedTx.failureReason || "Transaction rejected by issuing bank or customer cancelled authorization."}
                  </div>
                  {selectedTx.failureCode && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Error Code: <code>{selectedTx.failureCode}</code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund Alert (if refunded) */}
            {selectedTx.paymentStatus === "Refunded" && (
              <div
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid #8b5cf644",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "20px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <RotateCcw size={20} style={{ color: "#8b5cf6", flexShrink: 0, marginTop: "2px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#8b5cf6", fontWeight: 700, fontSize: "13px" }}>
                    Refund Processed ({formatRupees(selectedTx.refundAmount || selectedTx.totalAmount)})
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
                    Refund ID: <code style={{ fontWeight: 700 }}>{selectedTx.refundId || "N/A"}</code>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Reason: {selectedTx.refundReason || "Administrative refund"}
                  </div>
                  {selectedTx.refundedAt && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Processed at: {formatDate(selectedTx.refundedAt)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer & Address Details */}
            <div
              style={{
                background: "var(--bg-surface-alt)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <span style={labelStyle}>Customer Information</span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "13px",
                  marginTop: "6px",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Name: </span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {selectedTx.customerName || selectedTx.user?.name || "N/A"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Email: </span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {selectedTx.customerEmail || selectedTx.user?.email || "N/A"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Phone: </span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {selectedTx.shippingAddress?.phone || selectedTx.user?.phone || "N/A"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Delivery City: </span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {selectedTx.shippingAddress?.city
                      ? `${selectedTx.shippingAddress.city}, ${selectedTx.shippingAddress.state || ""}`
                      : "N/A"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            {selectedTx.items && selectedTx.items.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <span style={labelStyle}>Purchased Items ({selectedTx.items.length})</span>
                <div
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                  }}
                >
                  <table style={tableStyle}>
                    <thead>
                      <tr style={{ background: "var(--bg-surface-alt)" }}>
                        <th style={thStyle}>Product</th>
                        <th style={thStyle}>Price</th>
                        <th style={thStyle}>Qty</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTx.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600 }}>{item.name || item.product?.name || "Product"}</div>
                          </td>
                          <td style={tdStyle}>{formatRupees(item.price)}</td>
                          <td style={tdStyle}>x{item.quantity}</td>
                          <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                            {formatRupees(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "16px",
              }}
            >
              <div>
                {selectedTx.paymentStatus === "Paid" && (
                  <button
                    onClick={() => {
                      handleOpenRefund(selectedTx);
                    }}
                    style={{
                      ...cancelBtn,
                      color: "#8b5cf6",
                      borderColor: "#8b5cf644",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <RotateCcw size={15} /> Process Refund
                  </button>
                )}
              </div>
              <button onClick={() => setSelectedTx(null)} style={primaryBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Refund Modal ── */}
      {refundModalTx && (
        <div style={overlay} onClick={() => setRefundModalTx(null)}>
          <div
            style={{ ...modal, maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    background: "rgba(139, 92, 246, 0.15)",
                    color: "#8b5cf6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800 }}>
                    Process Payment Refund
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Payment ID: {refundModalTx.paymentId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRefundModalTx(null)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitRefund} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Refund Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  max={refundModalTx.totalAmount}
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  style={inputStyle}
                  required
                />
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Max refundable amount: {formatRupees(refundModalTx.totalAmount)}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Refund Reason</label>
                <textarea
                  rows={3}
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Explain reason for issuing this refund..."
                  required
                />
              </div>

              <div
                style={{
                  background: "rgba(139, 92, 246, 0.08)",
                  border: "1px solid #8b5cf633",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                ℹ️ Processing this refund will automatically update gateway status to <strong>refunded</strong>, generate a unique tracking Refund ID, and mark the order.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setRefundModalTx(null)}
                  style={cancelBtn}
                  disabled={refundSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...primaryBtn,
                    background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                  }}
                  disabled={refundSubmitting}
                >
                  {refundSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    `Confirm Refund ₹${refundForm.amount || refundModalTx.totalAmount}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Status Adjustment Modal ── */}
      {statusModalTx && (
        <div style={overlay} onClick={() => setStatusModalTx(null)}>
          <div
            style={{ ...modal, maxWidth: "460px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800 }}>
                    Update Transaction Status
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Payment ID: {statusModalTx.paymentId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStatusModalTx(null)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitStatusUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Payment Status</label>
                <select
                  value={statusForm.paymentStatus}
                  onChange={(e) => {
                    const ps = e.target.value;
                    let gs = statusForm.gatewayStatus;
                    if (ps === "Paid") gs = "captured";
                    else if (ps === "Failed") gs = "failed";
                    else if (ps === "Refunded") gs = "refunded";
                    else if (ps === "Pending") gs = "pending";
                    setStatusForm({ ...statusForm, paymentStatus: ps, gatewayStatus: gs });
                  }}
                  style={{ ...selectStyle, width: "100%" }}
                >
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Gateway Status</label>
                <select
                  value={statusForm.gatewayStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, gatewayStatus: e.target.value })}
                  style={{ ...selectStyle, width: "100%" }}
                >
                  <option value="captured">Captured</option>
                  <option value="authorized">Authorized</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {statusForm.paymentStatus === "Failed" && (
                <div>
                  <label style={labelStyle}>Failure Reason (Optional)</label>
                  <input
                    value={statusForm.failureReason}
                    onChange={(e) => setStatusForm({ ...statusForm, failureReason: e.target.value })}
                    placeholder="e.g. Card expired, Insufficient funds, User cancelled"
                    style={inputStyle}
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setStatusModalTx(null)}
                  style={cancelBtn}
                  disabled={statusSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={primaryBtn}
                  disabled={statusSubmitting}
                >
                  {statusSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Status"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
