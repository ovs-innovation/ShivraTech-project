import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Package,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/useShop";
import {
  apiAddProductReview,
  apiCancelOrder,
  apiGetMyOrders,
  apiReturnOrder,
} from "../services/api";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const formatRupees = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusStages = [
  { key: "Placed", label: "Order Placed" },
  { key: "Accepted", label: "Vendor Accepted" },
  { key: "Packed", label: "Packed in Warehouse" },
  { key: "Shipped", label: "Dispatched & Shipped" },
  { key: "Delivered", label: "Delivered" },
];

const getStatusStepIndex = (status) => {
  switch (status) {
    case "Placed":
      return 0;
    case "Accepted":
      return 1;
    case "Packed":
    case "Ready for Dispatch":
      return 2;
    case "Shipped":
      return 3;
    case "Delivered":
      return 4;
    default:
      return 0;
  }
};

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const { orders: localOrders, formatPrice } = useShop();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("Changed mind / ordered by mistake");

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("Aesthetic preference / wanted different model");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const res = await apiGetMyOrders();
        if (res?.data && res.data.length > 0) {
          setOrders(res.data);
          setLoading(false);
          return;
        }
      }
      // Fallback to local storage orders
      setOrders(localOrders || []);
    } catch (err) {
      console.warn("[Orders] Backend fetch fallback:", err.message);
      setOrders(localOrders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated, localOrders]);

  const handleCancelOrder = async () => {
    setActionLoading(true);
    try {
      if (cancelOrderId) {
        await apiCancelOrder(cancelOrderId, cancelReason);
        showToast("Order cancelled successfully");
        setShowCancelModal(false);
        await fetchOrders();
      }
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async () => {
    setActionLoading(true);
    try {
      if (returnOrderId) {
        await apiReturnOrder(returnOrderId, returnReason);
        showToast("Return request registered! Doorstep pickup scheduled.");
        setShowReturnModal(false);
        await fetchOrders();
      }
    } catch (err) {
      alert(err.message || "Failed to submit return request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (reviewProduct?.product || reviewProduct?._id) {
        const prodId = reviewProduct.product || reviewProduct._id;
        await apiAddProductReview(prodId, { rating, comment: reviewComment });
        showToast("Thank you! Your product review has been published.");
        setShowReviewModal(false);
        setReviewComment("");
      } else {
        showToast("Review submitted successfully!");
        setShowReviewModal(false);
      }
    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-purple-200 border-t-[#4A0D4F]" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div
          className="mx-auto max-w-3xl rounded-[30px] border px-6 py-10 text-center sm:px-8 sm:py-12 shadow-sm"
          style={{ borderColor: "#eadbe6", backgroundColor: "#fff" }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-[#4A0D4F] mb-4">
            <Package size={28} />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#4A0D4F]">
            My Orders
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            No orders placed yet
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-6 text-slate-600">
            Browse our aesthetic gadget catalog, place an order from your cart, and track live status here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
            >
              Start Shopping
            </Link>
            <Link
              to="/cart"
              className="rounded-full border border-purple-200 px-6 py-3 text-xs sm:text-sm font-bold text-[#4A0D4F] hover:bg-purple-50"
            >
              Go to Cart
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 md:py-14 bg-[#FBF8FC] min-h-screen">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl border border-purple-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xl backdrop-blur-xl animate-fade-in">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-purple-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#4A0D4F]">
              Live Order Tracking
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Your Orders ({orders.length})
            </h1>
          </div>

          <Link
            to="/shop"
            className="w-fit rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold text-[#4A0D4F] hover:bg-purple-50 transition"
          >
            Continue Shopping →
          </Link>
        </div>

        {/* Orders Card List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStatus = order.orderStatus || "Placed";
            const stepIndex = getStatusStepIndex(currentStatus);
            const isCancelled = currentStatus === "Cancelled";
            const isReturned = currentStatus === "Returned";
            const isDelivered = currentStatus === "Delivered";
            const canCancel = ["Placed", "Accepted"].includes(currentStatus);
            const canReturn = isDelivered;

            return (
              <article
                key={order._id || order.id || order.orderId}
                className="rounded-[28px] border border-purple-100 bg-white p-5 sm:p-7 shadow-[0_10px_34px_rgba(74,13,79,0.05)] transition hover:shadow-md"
              >
                {/* Top Order Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black text-[#4A0D4F]">
                        Order #{order.orderId || order.id || order._id?.slice(-8)}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : isCancelled
                          ? "bg-rose-100 text-rose-800"
                          : isReturned
                          ? "bg-purple-100 text-purple-800"
                          : currentStatus === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {currentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-900">
                      {order.totalAmount ? formatRupees(order.totalAmount) : (order.totalLabel ?? formatPrice(order.total))}
                    </span>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Payment: {order.paymentMethod || "COD"} ({order.paymentStatus || "Pending"})
                    </p>
                  </div>
                </div>

                {/* Tracking Progress Bar (Only when active & not cancelled) */}
                {!isCancelled && !isReturned && (
                  <div className="py-5 border-b border-purple-50">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Delivery Timeline
                    </span>

                    <div className="grid grid-cols-5 gap-1 relative">
                      {statusStages.map((st, idx) => {
                        const isPastOrCurrent = idx <= stepIndex;
                        const isCurrent = idx === stepIndex;
                        return (
                          <div key={st.key} className="flex flex-col items-center text-center">
                            <div
                              className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                                isCurrent
                                  ? "bg-[#4A0D4F] text-white ring-4 ring-purple-100 shadow-sm"
                                  : isPastOrCurrent
                                  ? "bg-[#B35FA3] text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {isPastOrCurrent ? "✓" : idx + 1}
                            </div>
                            <span
                              className={`mt-1.5 text-[10px] sm:text-xs font-bold leading-tight ${
                                isCurrent
                                  ? "text-[#4A0D4F]"
                                  : isPastOrCurrent
                                  ? "text-slate-800"
                                  : "text-slate-400"
                              }`}
                            >
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tracking ID & Courier details if available */}
                    {order.courierName && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-purple-50/60 p-3 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-[#4A0D4F]" />
                          <span>Courier: <strong>{order.courierName}</strong></span>
                          <span>• Tracking Waybill: <strong className="font-mono text-[#4A0D4F]">{order.trackingNumber}</strong></span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          In Transit
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Cancelled / Return Alert Notice */}
                {isCancelled && (
                  <div className="my-4 flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-700 font-semibold">
                    <XCircle size={17} className="text-rose-600 flex-shrink-0" />
                    <span>Order Cancelled: {order.cancelReason || "Cancelled by customer"}</span>
                  </div>
                )}

                {isReturned && (
                  <div className="my-4 flex items-center gap-2.5 rounded-2xl bg-purple-50 border border-purple-100 p-3.5 text-xs text-purple-800 font-semibold">
                    <RotateCcw size={17} className="text-[#4A0D4F] flex-shrink-0" />
                    <span>Return Requested: {order.returnReason || "Doorstep return pickup initiated"}</span>
                  </div>
                )}

                {/* Order Items List */}
                <div className="py-4 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-[#FAF8FC] p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        {item.img && (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-2xs flex-shrink-0">
                            <img src={item.img} alt={item.title} className="h-full w-full object-contain" />
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/product/${item.slug || "item"}`}
                            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#4A0D4F] transition line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Qty: {item.quantity} • Seller: {item.sellerName || "Shivra Verified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          {formatRupees(
                            (typeof item.price === "number" ? item.price : parseInt(String(item.price).replace(/\D/g, "") || 0)) * item.quantity
                          )}
                        </span>

                        {isDelivered && (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewProduct(item);
                              setRating(5);
                              setReviewComment("");
                              setShowReviewModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition"
                          >
                            <Star size={12} fill="currentColor" />
                            <span>Rate & Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions: Cancel Order or Return Order */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-50">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <span>100% Buyer Escrow Protection</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelOrderId(order._id);
                          setShowCancelModal(true);
                        }}
                        className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Cancel Order
                      </button>
                    )}

                    {canReturn && (
                      <button
                        type="button"
                        onClick={() => {
                          setReturnOrderId(order._id);
                          setShowReturnModal(true);
                        }}
                        className="rounded-full border border-purple-200 px-4 py-1.5 text-xs font-bold text-[#4A0D4F] hover:bg-purple-50 transition flex items-center gap-1"
                      >
                        <RotateCcw size={12} />
                        <span>Request Return</span>
                      </button>
                    )}
                  </div>
                </div>

              </article>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* REVIEW MODAL                                                              */}
      {/* ========================================================================= */}
      {showReviewModal && reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-[28px] border border-purple-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
            >
              <X size={18} />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">
              Product Feedback
            </span>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Rate & Review Gadget
            </h3>
            <p className="text-xs text-slate-500 mb-4 truncate">
              {reviewProduct.title}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star Rating selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`p-1.5 rounded-lg transition ${
                        num <= rating ? "text-amber-500" : "text-slate-300 hover:text-amber-300"
                      }`}
                    >
                      <Star size={24} fill={num <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Review / Experience
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about sound quality, build, battery, or aesthetics..."
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-full bg-[#4A0D4F] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#380B3C]"
                >
                  {actionLoading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANCEL ORDER MODAL                                                        */}
      {/* ========================================================================= */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-[28px] border border-rose-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">Cancel Order</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please choose a reason for cancelling this order:
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs outline-none focus:border-[#B35FA3] mb-4"
            >
              <option value="Changed mind / ordered by mistake">Changed mind / ordered by mistake</option>
              <option value="Found a better price elsewhere">Found a better price elsewhere</option>
              <option value="Delivery time is too long">Delivery time is too long</option>
              <option value="Incorrect shipping address entered">Incorrect shipping address entered</option>
            </select>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancelOrder}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RETURN ORDER MODAL                                                        */}
      {/* ========================================================================= */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-[28px] border border-purple-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">Request 7-Day Return</h3>
            <p className="text-xs text-slate-500 mb-4">
              Doorstep pickup will be scheduled by our courier partner within 24-48 hours.
            </p>

            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs outline-none focus:border-[#B35FA3] mb-4"
            >
              <option value="Aesthetic preference / wanted different model">Aesthetic preference / wanted different model</option>
              <option value="Item damaged or not working">Item damaged or not working</option>
              <option value="Missing accessories">Missing accessories</option>
              <option value="Not as described on store">Not as described on store</option>
            </select>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReturnOrder}
                className="rounded-full bg-[#4A0D4F] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#380B3C]"
              >
                {actionLoading ? "Processing..." : "Schedule Return Pickup"}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default OrdersPage;
