import { useCallback, useEffect, useState } from "react";
import { Edit2, Loader2, RefreshCcw, Search, Store, X, Package, User } from "lucide-react";
import { apiGetOrders, apiUpdateOrderStatus } from "../../api";
import {
  Badge, Spinner, ActionBtn, Pagination,
  overlay, modal, primaryBtn, cancelBtn, inputWithIcon,
  inputStyle, selectStyle, iconBtn, tableStyle, thStyle, tdStyle,
} from "../../components/UI";

const formatRupees = (v = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_COLORS = {
  Placed: "#6366f1", Accepted: "#3b82f6", Packed: "#8b5cf6",
  "Ready for Dispatch": "#06b6d4", Shipped: "#f59e0b",
  Delivered: "#10b981", Cancelled: "#ef4444", Returned: "#f97316",
};

const ORDER_STATUSES = [
  "Placed", "Accepted", "Packed", "Ready for Dispatch",
  "Shipped", "Delivered", "Cancelled", "Returned",
];

const labelStyle = {
  display: "block", color: "var(--text-secondary)", fontSize: "11px",
  fontWeight: 600, marginBottom: "6px",
  textTransform: "uppercase", letterSpacing: "0.5px",
};

export default function OrdersTab({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editOrder, setEditOrder] = useState(null);
  const [form, setForm] = useState({ orderStatus: "", courierName: "", trackingNumber: "", trackingUrl: "" });
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append("search", search);
      if (statusFilter) p.append("status", statusFilter);
      p.append("page", page);
      p.append("limit", 15);
      const res = await apiGetOrders(p.toString());
      setOrders(res.data?.orders || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [search, statusFilter, page, showToast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (order) => {
    setEditOrder(order);
    setForm({
      orderStatus: order.orderStatus,
      courierName: order.courierName || "",
      trackingNumber: order.trackingNumber || "",
      trackingUrl: order.trackingUrl || "",
    });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await apiUpdateOrderStatus(editOrder._id, form);
      showToast("Order updated!");
      setEditOrder(null);
      load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setUpdating(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
          <input
            id="order-search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Order ID, customer, vendor store name..."
            style={inputWithIcon}
          />
        </div>
        <select id="order-status-filter" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} style={iconBtn} title="Refresh"><RefreshCcw size={16} /></button>
        <span style={{ color: "var(--text-muted)", fontSize: "13px", alignSelf: "center", whiteSpace: "nowrap" }}>{total} orders</span>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div style={{ overflowX: "auto", background: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {[
                    "Order ID",
                    "Customer",
                    "Vendor / Store",
                    "Items",
                    "Total",
                    "Payment",
                    "Status",
                    "Date",
                    "",
                  ].map((h, i) => (
                    <th key={i} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0
                  ? <tr><td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>No orders found</td></tr>
                  : orders.map(o => {
                    const storeNames = o.storeNames?.length > 0
                      ? o.storeNames
                      : Array.from(new Set(o.items?.map(i => i.storeName || i.sellerName || i.seller?.storeName || i.seller?.name).filter(Boolean)));
                    const primaryStore = storeNames[0] || o.primaryStoreName || "Shivra Partner";
                    const otherStoresCount = storeNames.length > 1 ? storeNames.length - 1 : 0;
                    const primaryVendorName = o.vendors?.[0]?.vendorName || (typeof o.items?.[0]?.seller === "object" ? o.items[0]?.seller?.name : null);

                    return (
                      <tr key={o._id}>
                        <td style={tdStyle}>
                          <span style={{ color: "#a78bfa", fontWeight: 700 }}>{o.orderId}</span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {o.customerName || o.user?.name || "Customer"}
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                            {o.customerEmail || o.user?.email || ""}
                          </div>
                        </td>
                        {/* Vendor / Store column */}
                        <td style={tdStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "3px 8px",
                                  borderRadius: "7px",
                                  background: "rgba(139, 92, 246, 0.12)",
                                  border: "1px solid rgba(139, 92, 246, 0.28)",
                                  color: "#a78bfa",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                }}
                              >
                                <Store size={13} style={{ flexShrink: 0 }} />
                                {primaryStore}
                              </span>
                              {otherStoresCount > 0 && (
                                <span
                                  style={{
                                    fontSize: "10.5px",
                                    padding: "2px 6px",
                                    borderRadius: "6px",
                                    background: "var(--bg-surface-alt)",
                                    border: "1px solid var(--border-color)",
                                    color: "var(--text-muted)",
                                    fontWeight: 600,
                                  }}
                                  title={storeNames.slice(1).join(", ")}
                                >
                                  +{otherStoresCount} more
                                </span>
                              )}
                            </div>
                            {primaryVendorName && primaryVendorName !== primaryStore && (
                              <span style={{ fontSize: "11px", color: "var(--text-muted)", paddingLeft: "2px" }}>
                                Vendor: {primaryVendorName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{o.items?.length}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: "#10b981", fontWeight: 700 }}>{formatRupees(o.totalAmount)}</span>
                        </td>
                        <td style={tdStyle}>
                          <Badge color={o.paymentStatus === "Paid" ? "#10b981" : o.paymentStatus === "Refunded" ? "#8b5cf6" : "#f59e0b"}>
                            {o.paymentStatus}
                          </Badge>
                        </td>
                        <td style={tdStyle}>
                          <Badge color={STATUS_COLORS[o.orderStatus] || "#6b7280"}>
                            {o.orderStatus}
                          </Badge>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{formatDate(o.createdAt)}</span>
                        </td>
                        <td style={tdStyle}>
                          <ActionBtn color="#6366f1" title="View / Update Order" onClick={() => openEdit(o)}>
                            <Edit2 size={14} />
                          </ActionBtn>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} setPage={setPage} />
        </>
      )}

      {/* Edit & Order Details Modal */}
      {editOrder && (
        <div style={overlay} onClick={() => setEditOrder(null)}>
          <div style={{ ...modal, maxWidth: "560px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
              <div>
                <h3 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "18px", margin: 0 }}>
                  Order Details · {editOrder.orderId}
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Placed on {formatDate(editOrder.createdAt)} by {editOrder.customerName || editOrder.user?.name}
                </div>
              </div>
              <button onClick={() => setEditOrder(null)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Vendor & Store Information Block */}
            <div style={{ background: "var(--bg-surface-alt)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Store size={16} style={{ color: "#a78bfa" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Vendor / Store Details
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {editOrder.items?.map((item, idx) => {
                  const sName = item.storeName || item.sellerName || (typeof item.seller === "object" ? item.seller?.storeName || item.seller?.name : null) || "Shivra Store";
                  const vName = (typeof item.seller === "object" ? item.seller?.name : null) || item.sellerName || "";
                  const vEmail = typeof item.seller === "object" ? item.seller?.email : "";
                  const vPhone = typeof item.seller === "object" ? item.seller?.phone : "";

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        background: "var(--card-bg)",
                        borderRadius: "8px",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "6px", background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Package size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {item.title} <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>×{item.quantity}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                            <span style={{ fontSize: "11.5px", color: "#a78bfa", fontWeight: 700 }}>
                              Store: {sName}
                            </span>
                            {vName && vName !== sName && (
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                • Vendor: {vName}
                              </span>
                            )}
                            {vPhone && (
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                • Ph: {vPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatRupees(item.price * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery address summary */}
            {editOrder.shippingAddress && (
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px", padding: "10px 12px", background: "var(--bg-surface-alt)", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Delivery Address: </span>
                {editOrder.shippingAddress.address}, {editOrder.shippingAddress.city}, {editOrder.shippingAddress.state} - {editOrder.shippingAddress.postalCode} (Phone: {editOrder.shippingAddress.phone})
              </div>
            )}

            {/* Status & Courier update form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label id="lbl-status" style={labelStyle}>Order Status</label>
                <select id="order-status-edit" value={form.orderStatus} onChange={e => setForm({ ...form, orderStatus: e.target.value })} style={{ ...selectStyle, width: "100%" }}>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Courier Name</label>
                  <input id="courier-name" value={form.courierName} onChange={e => setForm({ ...form, courierName: e.target.value })} placeholder="e.g. BlueDart, DTDC" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tracking Number</label>
                  <input id="tracking-number" value={form.trackingNumber} onChange={e => setForm({ ...form, trackingNumber: e.target.value })} placeholder="AWB / Tracking ID" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tracking URL</label>
                <input id="tracking-url" value={form.trackingUrl} onChange={e => setForm({ ...form, trackingUrl: e.target.value })} placeholder="https://track.courier.com/..." style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditOrder(null)} style={cancelBtn}>Cancel</button>
              <button onClick={handleUpdate} disabled={updating} style={primaryBtn}>
                {updating ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
                {updating ? "Updating..." : "Update Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
