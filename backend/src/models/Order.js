import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  slug: { type: String, default: "" },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  img: { type: String, default: "" },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sellerName: { type: String, default: "Shivra Seller" },
  storeName: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () => `ST-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "India" },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Card", "UPI", "NetBanking"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Failed"],
      default: "Pending",
    },
    paymentId: {
      type: String,
      default: function () {
        const prefix = this.paymentMethod === "COD" ? "cod" : "pay_rzp";
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      },
      index: true,
    },
    gateway: {
      type: String,
      default: function () {
        return this.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay";
      },
    },
    gatewayStatus: {
      type: String,
      enum: ["captured", "authorized", "failed", "refunded", "pending"],
      default: function () {
        if (this.paymentStatus === "Paid") return "captured";
        if (this.paymentStatus === "Failed") return "failed";
        if (this.paymentStatus === "Refunded") return "refunded";
        return "pending";
      },
    },
    currency: {
      type: String,
      default: "INR",
    },
    failureReason: {
      type: String,
      default: "",
    },
    failureCode: {
      type: String,
      default: "",
    },
    refundId: {
      type: String,
      default: "",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: "",
    },
    refundedAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Accepted",
        "Packed",
        "Ready for Dispatch",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Placed",
    },
    courierName: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    couponCode: { type: String, default: "" },
    couponDiscount: { type: Number, default: 0.0 },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponType: { type: String, enum: ["platform", "vendor", ""], default: "" },
    totalAmount: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    cancelReason: { type: String, default: "" },
    returnReason: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
