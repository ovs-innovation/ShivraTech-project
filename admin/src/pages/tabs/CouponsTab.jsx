import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  Globe,
  Loader2,
  Percent,
  Plus,
  Power,
  RefreshCcw,
  Search,
  Sparkles,
  Store,
  Tag,
  Ticket,
  TicketPercent,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  apiGetCoupons,
  apiCreateCoupon,
  apiUpdateCoupon,
  apiDeleteCoupon,
  apiToggleCouponStatus,
  apiGetVendors,
} from "../../api";
import {
  ActionBtn,
  Badge,
  Pagination,
  Spinner,
  cancelBtn,
  cardStyle,
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

const labelStyle = {
  display: "block",
  color: "var(--text-secondary)",
  fontSize: "11px",
  fontWeight: 600,
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export default function CouponsTab({ showToast, showConfirm }) {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    platformCount: 0,
    vendorCount: 0,
    activeCount: 0,
    expiredCount: 0,
    totalRedemptions: 0,
  });
  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialFormState = {
    code: "",
    title: "",
    description: "",
    type: "platform",
    vendor: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    usageLimit: 100,
    perUserLimit: 1,
    status: "active",
  };

  const [form, setForm] = useState(initialFormState);

  // Fetch approved vendors for vendor coupon selection
  const fetchVendors = useCallback(async () => {
    try {
      const res = await apiGetVendors("limit=100");
      setVendorsList(res.data?.vendors || []);
    } catch {
      // fallback
    }
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append("search", search);
      if (typeFilter !== "all") p.append("type", typeFilter);
      if (statusFilter !== "all") p.append("status", statusFilter);
      p.append("page", page);
      p.append("limit", 15);

      const res = await apiGetCoupons(p.toString());
      setCoupons(res.data?.coupons || []);
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
  }, [search, typeFilter, statusFilter, page, showToast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code "${code}" copied to clipboard!`);
  };

  const openCreateModal = () => {
    setEditCoupon(null);
    setForm(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditCoupon(coupon);
    setForm({
      code: coupon.code,
      title: coupon.title || "",
      description: coupon.description || "",
      type: coupon.type,
      vendor: typeof coupon.vendor === "object" ? coupon.vendor?._id : coupon.vendor || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      minOrderAmount: coupon.minOrderAmount || "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : "",
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
      usageLimit: coupon.usageLimit || 100,
      perUserLimit: coupon.perUserLimit || 1,
      status: coupon.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      showToast("Coupon code is required", "error");
      return;
    }
    if (form.type === "vendor" && !form.vendor) {
      showToast("Please select a vendor for vendor coupon", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editCoupon) {
        await apiUpdateCoupon(editCoupon._id, form);
        showToast(`Coupon ${form.code.toUpperCase()} updated successfully`);
      } else {
        await apiCreateCoupon(form);
        showToast(`Coupon ${form.code.toUpperCase()} created successfully`);
      }
      setModalOpen(false);
      loadCoupons();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await apiToggleCouponStatus(coupon._id);
      showToast(`Coupon marked ${coupon.status === "active" ? "inactive" : "active"}`);
      loadCoupons();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = (coupon) => {
    showConfirm(
      `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`,
      async () => {
        try {
          await apiDeleteCoupon(coupon._id);
          showToast(`Coupon "${coupon.code}" deleted`);
          loadCoupons();
        } catch (err) {
          showToast(err.message, "error");
        }
      }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── KPI Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Total Campaigns */}
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderLeft: "4px solid #6366f1",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.12)",
              color: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TicketPercent size={24} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
              Total Coupons
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {stats.totalCount}
            </div>
            <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600, marginTop: "2px" }}>
              {stats.activeCount} active campaigns
            </div>
          </div>
        </div>

        {/* Platform Coupons */}
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              background: "rgba(59, 130, 246, 0.12)",
              color: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Globe size={24} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
              Platform Coupons
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {stats.platformCount}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Site-wide promotions
            </div>
          </div>
        </div>

        {/* Vendor Coupons */}
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderLeft: "4px solid #8b5cf6",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              background: "rgba(139, 92, 246, 0.12)",
              color: "#8b5cf6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Store size={24} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
              Vendor Coupons
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {stats.vendorCount}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Store-specific discounts
            </div>
          </div>
        </div>

        {/* Total Redemptions */}
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderLeft: "4px solid #10b981",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
              Total Redemptions
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
              {stats.totalRedemptions}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Coupons claimed by users
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters, Search & Action Bar ── */}
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
          {/* Quick Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {[
              { id: "all", label: "All Types", count: stats.totalCount },
              { id: "platform", label: "Platform", icon: Globe, color: "#3b82f6", count: stats.platformCount },
              { id: "vendor", label: "Vendor Stores", icon: Store, color: "#8b5cf6", count: stats.vendorCount },
            ].map((t) => {
              const active = typeFilter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTypeFilter(t.id);
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
                    gap: "7px",
                    transition: "all 0.15s",
                  }}
                >
                  {t.icon && <t.icon size={14} style={{ color: t.color }} />}
                  {t.label}
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
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Controls */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={selectStyle}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>

            <button onClick={loadCoupons} style={iconBtn} title="Refresh">
              <RefreshCcw size={16} />
            </button>

            <button
              onClick={openCreateModal}
              style={{
                ...primaryBtn,
                padding: "9px 18px",
              }}
            >
              <Plus size={16} /> Create Coupon
            </button>
          </div>
        </div>

        {/* Search Input Row */}
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
              id="coupon-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by coupon code (e.g. WELCOME20), store name, or description..."
              style={inputWithIcon}
            />
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "13px", whiteSpace: "nowrap" }}>
            {total} campaigns found
          </span>
        </div>
      </div>

      {/* ── Coupons Table ── */}
      {loading ? (
        <Spinner />
      ) : (
        <div style={{ ...cardStyle, padding: "0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "var(--bg-surface-alt)" }}>
                  <th style={thStyle}>Coupon Code</th>
                  <th style={thStyle}>Type & Scope</th>
                  <th style={thStyle}>Discount</th>
                  <th style={thStyle}>Min. Spend</th>
                  <th style={thStyle}>Redemptions</th>
                  <th style={thStyle}>Validity</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
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
                      <Ticket size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                      <div style={{ fontSize: "16px", fontWeight: 600 }}>No coupons found</div>
                      <div style={{ fontSize: "13px", marginTop: "4px" }}>
                        Click "+ Create Coupon" to launch your first promotional discount.
                      </div>
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => {
                    const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
                    const usagePercent = Math.min(100, Math.round(((c.usageCount || 0) / (c.usageLimit || 1)) * 100));

                    return (
                      <tr
                        key={c._id}
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
                        {/* Coupon Code */}
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: "13px",
                                fontWeight: 800,
                                background: "rgba(139, 92, 246, 0.14)",
                                color: "#a78bfa",
                                border: "1px dashed rgba(139, 92, 246, 0.4)",
                                padding: "4px 8px",
                                borderRadius: "8px",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {c.code}
                            </span>
                            <button
                              onClick={() => copyCode(c.code)}
                              title="Copy Code"
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                padding: "3px",
                              }}
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                          {c.title && c.title !== c.code && (
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
                              {c.title}
                            </div>
                          )}
                        </td>

                        {/* Type & Scope */}
                        <td style={tdStyle}>
                          {c.type === "platform" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 9px",
                                borderRadius: "8px",
                                background: "rgba(59, 130, 246, 0.12)",
                                color: "#3b82f6",
                                border: "1px solid rgba(59, 130, 246, 0.25)",
                                fontSize: "11px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              <Globe size={12} /> Platform Wide
                            </span>
                          ) : (
                            <div>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "3px 9px",
                                  borderRadius: "8px",
                                  background: "rgba(139, 92, 246, 0.12)",
                                  color: "#a78bfa",
                                  border: "1px solid rgba(139, 92, 246, 0.25)",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                              >
                                <Store size={12} />
                                {c.storeName || c.vendor?.storeName || "Vendor Store"}
                              </span>
                              {c.vendor?.name && (
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                  By {c.vendor.name}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Discount */}
                        <td style={tdStyle}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                            {c.discountType === "percentage" ? (
                              <span style={{ color: "#10b981" }}>{c.discountValue}% OFF</span>
                            ) : (
                              <span style={{ color: "#10b981" }}>{formatRupees(c.discountValue)} OFF</span>
                            )}
                          </div>
                          {c.discountType === "percentage" && c.maxDiscountAmount > 0 && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                              Max discount: {formatRupees(c.maxDiscountAmount)}
                            </div>
                          )}
                        </td>

                        {/* Min Spend */}
                        <td style={tdStyle}>
                          {c.minOrderAmount > 0 ? (
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                              {formatRupees(c.minOrderAmount)}
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>No minimum</span>
                          )}
                        </td>

                        {/* Redemptions Progress */}
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                            <span>{c.usageCount || 0}</span>
                            <span style={{ color: "var(--text-muted)" }}>/ {c.usageLimit}</span>
                          </div>
                          <div
                            style={{
                              width: "90px",
                              height: "5px",
                              borderRadius: "4px",
                              background: "var(--bg-surface-alt)",
                              border: "1px solid var(--border-color)",
                              marginTop: "5px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${usagePercent}%`,
                                height: "100%",
                                background: usagePercent >= 100 ? "#ef4444" : "#8b5cf6",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        </td>

                        {/* Validity */}
                        <td style={tdStyle}>
                          <div style={{ fontSize: "12px", color: isExpired ? "#ef4444" : "var(--text-secondary)" }}>
                            Exp: {formatDate(c.expiryDate)}
                          </div>
                          {isExpired && (
                            <span style={{ fontSize: "10.5px", color: "#ef4444", fontWeight: 700 }}>
                              Expired
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={tdStyle}>
                          {isExpired ? (
                            <Badge color="#ef4444">Expired</Badge>
                          ) : c.status === "active" ? (
                            <Badge color="#10b981">Active</Badge>
                          ) : (
                            <Badge color="#6b7280">Inactive</Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            {/* Toggle Active / Inactive */}
                            <ActionBtn
                              color={c.status === "active" ? "#10b981" : "#6b7280"}
                              title={c.status === "active" ? "Deactivate Coupon" : "Activate Coupon"}
                              onClick={() => handleToggle(c)}
                            >
                              <Power size={14} />
                            </ActionBtn>

                            {/* Edit */}
                            <ActionBtn
                              color="#6366f1"
                              title="Edit Coupon"
                              onClick={() => openEditModal(c)}
                            >
                              <Edit2 size={14} />
                            </ActionBtn>

                            {/* Delete */}
                            <ActionBtn
                              color="#ef4444"
                              title="Delete Coupon"
                              onClick={() => handleDelete(c)}
                            >
                              <Trash2 size={14} />
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

      {/* ── Create / Edit Coupon Modal ── */}
      {modalOpen && (
        <div style={overlay} onClick={() => setModalOpen(false)}>
          <div
            style={{ ...modal, maxWidth: "580px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "14px",
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
                  <TicketPercent size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
                    {editCoupon ? `Edit Coupon · ${editCoupon.code}` : "Create New Coupon"}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Configure platform-wide or vendor-specific discount rules
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Code & Title */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Coupon Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVE30"
                    style={{ ...inputStyle, textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Campaign Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Festival Special Discount"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Coupon Scope: Platform vs Vendor */}
              <div>
                <label style={labelStyle}>Coupon Scope *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "platform", vendor: "" })}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: form.type === "platform" ? "2px solid #3b82f6" : "1px solid var(--border-color)",
                      background: form.type === "platform" ? "rgba(59, 130, 246, 0.12)" : "var(--bg-surface-alt)",
                      color: form.type === "platform" ? "#3b82f6" : "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <Globe size={16} /> Platform Coupon
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "vendor" })}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: form.type === "vendor" ? "2px solid #8b5cf6" : "1px solid var(--border-color)",
                      background: form.type === "vendor" ? "rgba(139, 92, 246, 0.12)" : "var(--bg-surface-alt)",
                      color: form.type === "vendor" ? "#8b5cf6" : "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <Store size={16} /> Vendor Coupon
                  </button>
                </div>
              </div>

              {/* Vendor Selector if Vendor Coupon */}
              {form.type === "vendor" && (
                <div
                  style={{
                    background: "rgba(139, 92, 246, 0.08)",
                    border: "1px solid rgba(139, 92, 246, 0.25)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                >
                  <label style={{ ...labelStyle, color: "#a78bfa" }}>Select Vendor / Store *</label>
                  <select
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    style={{ ...selectStyle, width: "100%" }}
                    required
                  >
                    <option value="">-- Choose Vendor Store --</option>
                    {vendorsList.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.storeName || v.name} ({v.name} - {v.email})
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    ℹ️ This coupon will only apply to orders/items belonging to this vendor's store.
                  </div>
                </div>
              )}

              {/* Discount Type & Value */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    style={{ ...selectStyle, width: "100%" }}
                  >
                    <option value="percentage">Percentage (%) Discount</option>
                    <option value="fixed">Fixed Amount (₹) Flat Discount</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Discount Value {form.discountType === "percentage" ? "(%)" : "(₹)"} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={form.discountType === "percentage" ? "100" : undefined}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 250"}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* Max Discount & Min Order Amount */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>
                    Max Discount Cap (₹) {form.discountType === "fixed" ? "(N/A)" : ""}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={form.discountType === "fixed"}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="0 = No limit"
                    style={{ ...inputStyle, opacity: form.discountType === "fixed" ? 0.5 : 1 }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Min. Order Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0 = No minimum"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Start Date & Expiry Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Valid From</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Expiry Date *</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* Limits: Usage & Per User */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Total Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="Total redemptions"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Per User Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={form.perUserLimit}
                    onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                    placeholder="Uses per customer"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description / Notes</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Valid on all audio electronics above ₹999"
                  style={inputStyle}
                />
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ ...selectStyle, width: "100%" }}
                >
                  <option value="active">Active (Available for checkout)</option>
                  <option value="inactive">Inactive (Paused)</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={cancelBtn}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={primaryBtn}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : editCoupon ? (
                    "Save Changes"
                  ) : (
                    "Create Coupon"
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
