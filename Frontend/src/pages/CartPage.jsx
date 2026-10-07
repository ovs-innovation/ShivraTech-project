import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  TicketPercent,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/useShop";
import {
  apiCreateOrder,
  apiGetActiveCoupons,
  apiValidateCoupon,
} from "../services/api";
import { parsePrice } from "../data/products";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const CartPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    cartCount,
    cartItems,
    cartSubtotal,
    clearCart,
    formatPrice,
    placeOrder: localPlaceOrder,
    removeFromCart,
    updateCartQuantity,
  } = useShop();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // 'COD', 'UPI', 'Card'

  // Coupon & Promo States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [showOffersDrawer, setShowOffersDrawer] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [offersFilter, setOffersFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState("");

  // Delivery Address Form
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "+91 98765 43210",
    address: "204, Titanium Tech Hub, Cyber City",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
  });

  // Fetch available platform and vendor coupons for browsing
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const res = await apiGetActiveCoupons();
        if (res.data) setAvailableCoupons(res.data);
      } catch (err) {
        console.warn("[CartPage] Failed to fetch active coupons:", err.message);
      }
    };
    loadCoupons();
  }, []);

  // Re-validate coupon if cart total or items change
  useEffect(() => {
    if (appliedCoupon && cartItems.length > 0) {
      apiValidateCoupon({
        code: appliedCoupon.code,
        subtotal: cartSubtotal,
        items: cartItems.map((item) => ({
          slug: item.slug,
          price: item._numericPrice ?? parsePrice(item.price),
          quantity: item.quantity,
          seller: item.seller,
          storeName: item.storeName || item.sellerName,
        })),
      })
        .then((res) => {
          setAppliedCoupon(res.data);
          setCouponError("");
        })
        .catch((err) => {
          setCouponError(`Applied coupon deactivated: ${err.message}`);
          setAppliedCoupon(null);
        });
    } else if (cartItems.length === 0 && appliedCoupon) {
      setAppliedCoupon(null);
    }
  }, [cartSubtotal, cartItems.length]);

  const handleApplyCoupon = async (codeOverride) => {
    const code = (codeOverride || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a promo code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await apiValidateCoupon({
        code,
        subtotal: cartSubtotal,
        items: cartItems.map((item) => ({
          slug: item.slug,
          title: item.title,
          price: item._numericPrice ?? parsePrice(item.price),
          quantity: item.quantity,
          seller: item.seller,
          sellerName: item.sellerName,
          storeName: item.storeName,
        })),
      });

      setAppliedCoupon(res.data);
      setCouponCode(code);
      setCouponSuccess(res.data.message || `Coupon "${code}" applied!`);
      setShowOffersDrawer(false);
    } catch (err) {
      setCouponError(err.message || "Invalid or ineligible coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayable = Math.max(0, cartSubtotal - discountAmount);

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          slug: item.slug,
          title: item.title,
          price: item._numericPrice ?? parsePrice(item.price),
          quantity: item.quantity,
          img: item.img,
          categoryName: item.categoryName,
          seller: item.seller,
          sellerName: item.sellerName,
          storeName: item.storeName,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: cartSubtotal,
        shippingPrice: 0,
        couponCode: appliedCoupon?.code || "",
        couponDiscount: discountAmount,
        couponId: appliedCoupon?.couponId || null,
        couponType: appliedCoupon?.type || "",
        totalAmount: finalPayable,
      };

      // Call backend API if user is authenticated
      let createdOrder;
      try {
        const res = await apiCreateOrder(orderPayload);
        createdOrder = res.data;
      } catch (err) {
        console.warn("[Checkout] Backend order creation fallback to local:", err.message);
      }

      // Also sync with local context
      localPlaceOrder();
      clearCart();
      setShowCheckoutModal(false);
      navigate("/orders");
    } catch (err) {
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div
          className="mx-auto max-w-3xl rounded-[30px] border px-6 py-10 text-center sm:px-8 sm:py-12 shadow-sm"
          style={{ borderColor: "#eadbe6", backgroundColor: "#fff" }}
        >
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
          >
            <ShoppingBag size={28} />
          </div>
          <p
            className="mt-6 text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: PRIMARY }}
          >
            Cart
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">
            Your cart is empty
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Add products from the shop or category showcase to review them here
            before checkout.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
            >
              Start shopping
            </Link>
            <Link
              to="/orders"
              className="rounded-full border px-6 py-3 text-sm font-semibold hover:bg-purple-50 transition"
              style={{ borderColor: ACCENT, color: PRIMARY }}
            >
              View orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <span
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Shopping Cart
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Review Selected Products
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {cartCount} item{cartCount > 1 ? "s" : ""} ready for doorstep delivery.
            </p>
          </div>

          <Link
            to="/orders"
            className="w-full rounded-full border border-purple-200 px-5 py-2.5 text-center text-xs sm:text-sm font-bold text-[#4A0D4F] hover:bg-purple-50 sm:w-auto transition"
          >
            Track past orders
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Cart Items List */}
          <div className="space-y-3.5">
            {cartItems.map((item) => (
              <article
                key={item.slug}
                className="rounded-[24px] border border-purple-100 bg-white p-4 shadow-xs transition hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to={`/product/${item.slug}`}
                    className="flex h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FAF8FC] p-2"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-full w-full object-contain"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between gap-2 w-full">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B35FA3]">
                        {item.categoryName}
                      </span>
                      <Link to={`/product/${item.slug}`}>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#4A0D4F] transition line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm font-black text-slate-900 mt-1">
                        {item.price}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Stepper */}
                      <div className="flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/40 px-2.5 py-1">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.slug, item.quantity - 1)}
                          className="rounded-full p-0.5 text-slate-600 hover:text-[#4A0D4F]"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-4 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.slug, item.quantity + 1)}
                          className="rounded-full p-0.5 text-slate-600 hover:text-[#4A0D4F]"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.slug)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Order Summary & Checkout Action */}
          <aside className="rounded-[28px] border border-purple-100 bg-white p-5 sm:p-6 shadow-xs h-fit space-y-5">
            <h2 className="text-base font-black text-slate-900">Order Summary</h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Items ({cartCount})</span>
                <span className="font-bold text-slate-800">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Express Delivery</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Buyer Protection Escrow</span>
                <span className="font-bold text-emerald-600">Included (100%)</span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/80 border border-emerald-200 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag size={13} className="text-emerald-600" />
                    <span>Coupon ({appliedCoupon.code})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs sm:text-sm">-{formatPrice(discountAmount)}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10.5px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-purple-100 pt-3">
                <span className="text-base font-black text-slate-900">Total Payable</span>
                <span className="text-xl font-black text-[#4A0D4F]">{formatPrice(finalPayable)}</span>
              </div>
            </div>

            {/* Promo / Coupon Box */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TicketPercent size={14} className="text-[#4A0D4F]" />
                  <span>Promo Code</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowOffersDrawer(true)}
                  className="text-xs font-bold text-[#B35FA3] hover:text-[#4A0D4F] hover:underline cursor-pointer"
                >
                  View Offers ({availableCoupons.length})
                </button>
              </div>

              {!appliedCoupon ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponError) setCouponError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="e.g. SHIVRA10"
                        className="w-full rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 outline-none focus:border-[#B35FA3]"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={couponLoading || !couponCode.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="rounded-xl bg-[#4A0D4F] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#380B3C] transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {couponLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>
                  </div>

                  {couponError && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {couponSuccess && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <CheckCircle2 size={12} className="flex-shrink-0" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Check size={14} />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-black text-emerald-900 tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="ml-1.5 text-[10px] text-emerald-700 font-bold">
                          Applied
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium mt-1">
                    You save <strong className="font-black">{formatPrice(discountAmount)}</strong> on this order!
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenCheckout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white shadow-md hover:opacity-95 transition active:scale-98"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="rounded-xl bg-purple-50/60 p-3 text-center text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-[#4A0D4F]">
                <ShieldCheck size={16} />
                <span>Shivra Safe Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Doorstep verification & 7-day hassle-free return policy.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHECKOUT MODAL: DELIVERY ADDRESS & PAYMENT METHOD SELECTION               */}
      {/* ========================================================================= */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[28px] border border-purple-200 bg-white p-6 shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-[#4A0D4F] mb-1 font-bold text-xs uppercase tracking-wider">
              <Truck size={16} />
              <span>Fast Checkout</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Delivery & Payment Details
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your address to complete the order with Shivra Buyer Protection.
            </p>

            <form onSubmit={handleConfirmOrder} className="space-y-3.5">
              {/* Recipient Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address & House/Flat No. *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, address: e.target.value })
                  }
                  placeholder="e.g. Flat 402, Shivam Heights, Bandra West"
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              {/* City & PIN Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    placeholder="Mumbai"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    placeholder="400050"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "COD", label: "Cash on Delivery", icon: Truck },
                    { id: "UPI", label: "UPI / QR Code", icon: QrCode },
                    { id: "Card", label: "Debit / Credit Card", icon: CreditCard },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = paymentMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                          isSelected
                            ? "border-[#4A0D4F] bg-purple-50 text-[#4A0D4F] shadow-xs font-bold"
                            : "border-purple-100 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={18} className="mb-1" />
                        <span className="text-[11px] leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total & Action */}
              <div className="border-t border-purple-100 pt-3 mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Cart Items Total</span>
                  <span className="font-semibold text-slate-800">{formatPrice(cartSubtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <span className="font-semibold">Coupon Discount ({appliedCoupon.code})</span>
                    <span className="font-black">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Payable</span>
                    <span className="text-lg font-black text-[#4A0D4F]">{formatPrice(finalPayable)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#4A0D4F] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#380B3C] transition active:scale-95 disabled:opacity-50"
                  >
                    <span>{loading ? "Placing Order..." : "Confirm & Place Order"}</span>
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AVAILABLE OFFERS & COUPONS DRAWER / MODAL                        */}
      {/* ========================================================================= */}
      {showOffersDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[85vh] rounded-[28px] border border-purple-200 bg-white p-6 shadow-2xl flex flex-col my-8">
            <button
              type="button"
              onClick={() => setShowOffersDrawer(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-[#4A0D4F] mb-1 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Shivra Offers & Discounts</span>
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Available Coupons & Offers
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Apply platform-wide deals or vendor-exclusive coupons to save on your cart.
            </p>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: "all", label: `All Offers (${availableCoupons.length})` },
                {
                  id: "platform",
                  label: `Platform Deals (${availableCoupons.filter((c) => c.type === "platform").length})`,
                },
                {
                  id: "vendor",
                  label: `Store Specials (${availableCoupons.filter((c) => c.type === "vendor").length})`,
                },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOffersFilter(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    offersFilter === f.id
                      ? "bg-[#4A0D4F] text-white shadow-xs"
                      : "bg-purple-50 text-slate-600 hover:bg-purple-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Coupons List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(() => {
                const filtered = availableCoupons.filter((c) => {
                  if (offersFilter === "platform") return c.type === "platform";
                  if (offersFilter === "vendor") return c.type === "vendor";
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="rounded-2xl border border-dashed border-purple-200 p-8 text-center">
                      <TicketPercent size={28} className="mx-auto text-purple-300 mb-2" />
                      <p className="text-xs font-bold text-slate-700">No offers found in this category</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Check back soon for new promotions and seasonal deals!</p>
                    </div>
                  );
                }

                return filtered.map((c) => {
                  const isCurrent = appliedCoupon?.code === c.code;
                  const isVendor = c.type === "vendor";

                  // Check if cart satisfies minOrderAmount
                  const meetsMinOrder = !c.minOrderAmount || cartSubtotal >= c.minOrderAmount;

                  return (
                    <div
                      key={c._id}
                      className={`rounded-2xl border p-4 transition ${
                        isCurrent
                          ? "border-emerald-300 bg-emerald-50/40"
                          : "border-purple-100 bg-white hover:border-purple-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${
                                isVendor
                                  ? "bg-purple-100 text-[#4A0D4F]"
                                  : "bg-indigo-100 text-indigo-700"
                              }`}
                            >
                              {isVendor ? `Store: ${c.storeName || "Vendor"}` : "Platform Wide"}
                            </span>

                            <div className="flex items-center gap-1 rounded-md bg-purple-50 border border-purple-200/80 px-2 py-0.5 font-mono text-xs font-black text-[#4A0D4F]">
                              <span>{c.code}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(c.code)}
                                className="text-slate-400 hover:text-[#4A0D4F] ml-1 cursor-pointer"
                                title="Copy Code"
                              >
                                {copiedCode === c.code ? (
                                  <Check size={11} className="text-emerald-600" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 pt-1">
                            {c.discountType === "percentage"
                              ? `${c.discountValue}% OFF`
                              : `₹${c.discountValue} FLAT OFF`}
                            {c.title && (
                              <span className="font-bold text-slate-700 ml-2">
                                — {c.title}
                              </span>
                            )}
                          </h4>

                          {c.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {c.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={couponLoading || isCurrent}
                          onClick={() => handleApplyCoupon(c.code)}
                          className={`rounded-full px-4 py-1.5 text-xs font-black tracking-wider transition flex-shrink-0 cursor-pointer ${
                            isCurrent
                              ? "bg-emerald-600 text-white cursor-default"
                              : "border border-[#4A0D4F] text-[#4A0D4F] hover:bg-[#4A0D4F] hover:text-white"
                          }`}
                        >
                          {isCurrent ? "APPLIED ✓" : "APPLY"}
                        </button>
                      </div>

                      {/* Footer conditions */}
                      <div className="mt-3 flex items-center justify-between border-t border-purple-50 pt-2 text-[10.5px] text-slate-500 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {c.minOrderAmount > 0 && (
                            <span>Min. order: ₹{c.minOrderAmount}</span>
                          )}
                          {c.maxDiscountAmount > 0 && (
                            <span>• Max discount: ₹{c.maxDiscountAmount}</span>
                          )}
                        </div>

                        {c.expiryDate && (
                          <span className="text-slate-400">
                            Valid till {new Date(c.expiryDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pt-4 border-t border-purple-100 mt-2 text-center">
              <button
                type="button"
                onClick={() => setShowOffersDrawer(false)}
                className="rounded-full bg-slate-100 hover:bg-slate-200 px-6 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Close Offers
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default CartPage;
