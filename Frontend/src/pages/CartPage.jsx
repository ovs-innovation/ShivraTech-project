import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/useShop";
import { apiCreateOrder } from "../services/api";

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
          price: typeof item.price === "number" ? item.price : parseInt(String(item.price).replace(/\D/g, "")),
          quantity: item.quantity,
          img: item.img,
          categoryName: item.categoryName,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: cartSubtotal,
        shippingPrice: 0,
        totalAmount: cartSubtotal,
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
              <div className="flex items-center justify-between border-t border-purple-100 pt-3">
                <span className="text-base font-black text-slate-900">Total Payable</span>
                <span className="text-xl font-black text-[#4A0D4F]">{formatPrice(cartSubtotal)}</span>
              </div>
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
              <div className="border-t border-purple-100 pt-3 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Total Amount</span>
                  <span className="text-lg font-black text-[#4A0D4F]">{formatPrice(cartSubtotal)}</span>
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
            </form>
          </div>
        </div>
      )}

    </section>
  );
};

export default CartPage;
