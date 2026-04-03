import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/useShop";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartCount,
    cartItems,
    cartSubtotal,
    formatPrice,
    placeOrder,
    removeFromCart,
    updateCartQuantity,
  } = useShop();

  const handlePlaceOrder = () => {
    const order = placeOrder();

    if (order) {
      navigate("/orders");
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div
          className="mx-auto max-w-3xl rounded-[30px] border px-6 py-10 text-center sm:px-8 sm:py-12"
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
            Add products from the shop or product pages to review them here
            before placing an order.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full px-5 py-3 text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
            >
              Continue shopping
            </Link>
            <Link
              to="/orders"
              className="rounded-full border px-5 py-3 text-sm font-semibold"
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Cart
            </p>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Your selected products
            </h1>
            <p className="text-sm leading-7 text-slate-600">
              {cartCount} item{cartCount > 1 ? "s" : ""} ready for checkout.
            </p>
          </div>

          <Link
            to="/orders"
            className="w-full rounded-full border px-5 py-3 text-center text-sm font-semibold sm:w-auto"
            style={{ borderColor: ACCENT, color: PRIMARY }}
          >
            Track orders
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <article
                key={item.slug}
                className="rounded-[28px] border bg-white p-4 shadow-[0_16px_42px_rgba(74,13,79,0.06)] sm:p-5"
                style={{ borderColor: "#eadbe6" }}
              >
                <div className="flex flex-col gap-5 md:flex-row">
                  <Link
                    to={`/product/${item.slug}`}
                    className="flex h-32 w-full items-center justify-center rounded-[22px] sm:h-40 md:w-44"
                    style={{ backgroundColor: "#fbf6fa" }}
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-24 w-24 object-contain sm:h-32 sm:w-32"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <p
                        className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                        style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
                      >
                        {item.categoryName}
                      </p>
                      <Link to={`/product/${item.slug}`}>
                        <h2 className="text-lg font-bold leading-7 text-slate-900 sm:text-xl">
                          {item.title}
                        </h2>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-black text-slate-900">
                          {item.price}
                        </p>
                        <p className="text-sm text-slate-500">
                          Line total: {formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <div
                        className="flex items-center gap-3 rounded-full border px-3 py-2"
                        style={{ borderColor: "#eadbe6" }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.slug, item.quantity - 1)
                          }
                          className="rounded-full p-1 text-slate-600 transition hover:bg-[#f4e8f3]"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-5 text-center text-sm font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.slug, item.quantity + 1)
                          }
                          className="rounded-full p-1 text-slate-600 transition hover:bg-[#f4e8f3]"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.slug)}
                        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-[#fff3f5]"
                        style={{ borderColor: "#eadbe6", color: "#b42318" }}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside
            className="rounded-[30px] border bg-white p-5 shadow-[0_16px_42px_rgba(74,13,79,0.06)] sm:p-6"
            style={{ borderColor: "#eadbe6" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Order summary
            </p>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Items</span>
                <span className="font-semibold text-slate-900">{cartCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div
                className="flex items-center justify-between border-t pt-4"
                style={{ borderColor: "#f0e7ef" }}
              >
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-xl font-black text-slate-900">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              className="mt-8 w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
            >
              Place order
            </button>

            <Link
              to="/shop"
              className="mt-3 block rounded-full border px-5 py-3 text-center text-sm font-semibold"
              style={{ borderColor: ACCENT, color: PRIMARY }}
            >
              Add more products
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
