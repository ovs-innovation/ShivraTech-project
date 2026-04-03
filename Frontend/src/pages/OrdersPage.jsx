import { Link } from "react-router-dom";
import { useShop } from "../context/useShop";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const trackingSteps = [
  "Order placed",
  "Packed",
  "Out for delivery",
  "Delivered",
];

const getTrackingIndex = (createdAt) => {
  const minutesPassed = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 60000,
  );

  if (minutesPassed >= 180) {
    return 3;
  }

  if (minutesPassed >= 60) {
    return 2;
  }

  if (minutesPassed >= 15) {
    return 1;
  }

  return 0;
};

const OrdersPage = () => {
  const { formatPrice, orders } = useShop();

  if (orders.length === 0) {
    return (
      <section className="px-6 py-16">
        <div
          className="mx-auto max-w-3xl rounded-[30px] border px-8 py-12 text-center"
          style={{ borderColor: "#eadbe6", backgroundColor: "#fff" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: PRIMARY }}
          >
            Orders
          </p>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            No orders yet
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Place an order from your cart and you will be able to review and
            track it here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full px-5 py-3 text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
            >
              Start shopping
            </Link>
            <Link
              to="/cart"
              className="rounded-full border px-5 py-3 text-sm font-semibold"
              style={{ borderColor: ACCENT, color: PRIMARY }}
            >
              Open cart
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Orders
            </p>
            <h1 className="text-4xl font-black text-slate-900">
              Track your order list
            </h1>
            <p className="text-sm leading-7 text-slate-600">
              Review placed orders and follow their current delivery status.
            </p>
          </div>

          <Link
            to="/shop"
            className="rounded-full border px-5 py-3 text-sm font-semibold"
            style={{ borderColor: ACCENT, color: PRIMARY }}
          >
            Continue shopping
          </Link>
        </div>

        <div className="space-y-5">
          {orders.map((order) => {
            const trackingIndex = getTrackingIndex(order.createdAt);
            const currentStatus = trackingSteps[trackingIndex];

            return (
              <article
                key={order.id}
                className="rounded-[30px] border bg-white p-6 shadow-[0_16px_42px_rgba(74,13,79,0.06)]"
                style={{ borderColor: "#eadbe6" }}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                        style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
                      >
                        {order.id}
                      </span>
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                        style={{
                          backgroundColor: "#ecfdf3",
                          color: trackingIndex === 3 ? "#15803d" : PRIMARY,
                        }}
                      >
                        {currentStatus}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""} in this order
                    </h2>
                    <p className="text-sm leading-7 text-slate-600">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-sm text-slate-500">Order total</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                      {order.totalLabel ?? formatPrice(order.total)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <p
                      className="text-xs font-bold uppercase tracking-[0.18em]"
                      style={{ color: PRIMARY }}
                    >
                      Products
                    </p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={`${order.id}-${item.slug}`}
                          className="flex items-center gap-4 rounded-[20px] border p-4"
                          style={{ borderColor: "#eadbe6" }}
                        >
                          <div
                            className="flex h-20 w-20 items-center justify-center rounded-[18px]"
                            style={{ backgroundColor: "#fbf6fa" }}
                          >
                            <img
                              src={item.img}
                              alt={item.title}
                              className="h-14 w-14 object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-bold text-slate-900">
                              {item.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              {item.categoryName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {item.price}
                            </p>
                            <p className="text-xs text-slate-500">
                              Qty {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p
                      className="text-xs font-bold uppercase tracking-[0.18em]"
                      style={{ color: PRIMARY }}
                    >
                      Tracking
                    </p>
                    <div className="space-y-4 rounded-[24px] border p-5" style={{ borderColor: "#eadbe6" }}>
                      {trackingSteps.map((step, index) => {
                        const active = index <= trackingIndex;

                        return (
                          <div key={step} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <span
                                className="mt-1 h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: active ? ACCENT : "#d7d3db",
                                }}
                              />
                              {index < trackingSteps.length - 1 ? (
                                <span
                                  className="mt-2 h-10 w-px"
                                  style={{
                                    backgroundColor: active ? ACCENT : "#e7e1e8",
                                  }}
                                />
                              ) : null}
                            </div>
                            <div>
                              <p
                                className="text-sm font-bold"
                                style={{ color: active ? "#0f172a" : "#94a3b8" }}
                              >
                                {step}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {active
                                  ? "Current order progress recorded"
                                  : "Waiting for this stage"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OrdersPage;
