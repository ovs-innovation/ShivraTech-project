import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Place a new customer order
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalAmount,
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, "No order items in checkout");
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
    throw new ApiError(400, "Shipping address is incomplete");
  }

  // Populate vendor info from products if not provided
  const processedItems = await Promise.all(
    items.map(async (item) => {
      let seller = item.seller;
      let sellerName = item.sellerName;

      if (!seller && item.slug) {
        const prod = await Product.findOne({ slug: item.slug });
        if (prod) {
          seller = prod.seller;
          sellerName = prod.sellerName;
        }
      }

      return {
        ...item,
        seller: seller || req.user._id,
        sellerName: sellerName || "Shivra Partner",
      };
    })
  );

  const order = await Order.create({
    user: req.user._id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items: processedItems,
    shippingAddress,
    paymentMethod: paymentMethod || "COD",
    paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
    isPaid: paymentMethod !== "COD",
    paidAt: paymentMethod !== "COD" ? new Date() : undefined,
    itemsPrice: Number(itemsPrice || totalAmount),
    shippingPrice: Number(shippingPrice || 0),
    totalAmount: Number(totalAmount),
    orderStatus: "Placed",
  });

  res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
});

// @desc    Get logged-in customer's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

// @desc    Get order details by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email phone");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Authorization check: User must be customer who placed order OR seller of an item OR admin
  const isCustomer = order.user._id.toString() === req.user._id.toString();
  const isSellerOfItem = order.items.some(
    (item) => item.seller && item.seller.toString() === req.user._id.toString()
  );

  if (!isCustomer && !isSellerOfItem && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to view this order");
  }

  res.status(200).json(new ApiResponse(200, order, "Order retrieved successfully"));
});

// @desc    Cancel order (Customer)
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to cancel this order");
  }

  if (["Shipped", "Delivered"].includes(order.orderStatus)) {
    throw new ApiError(400, "Order is already in transit/delivered and cannot be cancelled directly");
  }

  order.orderStatus = "Cancelled";
  order.cancelReason = reason || "Cancelled by customer";
  await order.save();

  res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});

// @desc    Request return (Customer)
// @route   PUT /api/v1/orders/:id/return
// @access  Private
export const returnOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to request return for this order");
  }

  if (order.orderStatus !== "Delivered") {
    throw new ApiError(400, "Returns can only be requested for delivered orders");
  }

  order.orderStatus = "Returned";
  order.returnReason = reason || "Return requested by customer";
  await order.save();

  res.status(200).json(new ApiResponse(200, order, "Return request submitted successfully"));
});

// @desc    Get all incoming orders for vendor/seller
// @route   GET /api/v1/orders/seller/my-orders
// @access  Private/Seller
export const getSellerOrders = asyncHandler(async (req, res) => {
  // Find orders where at least one item belongs to this seller OR order placed directly
  const orders = await Order.find({
    $or: [
      { "items.seller": req.user._id },
      { "items.sellerName": req.user.storeName || req.user.name },
    ],
  }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, orders, "Vendor orders retrieved"));
});

// @desc    Update order status, packing, and dispatch info (Vendor / Admin only)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Seller
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, courierName, trackingNumber, trackingUrl, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.paymentStatus = "Paid";
      order.isPaid = true;
    }
  }

  if (courierName) order.courierName = courierName;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();
  res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

// @desc    Get Vendor sales analytics & earnings
// @route   GET /api/v1/orders/seller/analytics
// @access  Private/Seller
export const getSellerAnalytics = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [orders, productsCount] = await Promise.all([
    Order.find({
      $or: [
        { "items.seller": sellerId },
        { "items.sellerName": req.user.storeName || req.user.name },
      ],
    }),
    Product.countDocuments({ seller: sellerId }),
  ]);

  let totalEarnings = 0;
  let completedOrders = 0;
  let pendingOrders = 0;
  let returnedOrders = 0;

  orders.forEach((order) => {
    if (order.orderStatus === "Delivered") {
      totalEarnings += order.totalAmount;
      completedOrders++;
    } else if (["Placed", "Accepted", "Packed", "Ready for Dispatch", "Shipped"].includes(order.orderStatus)) {
      pendingOrders++;
    } else if (order.orderStatus === "Returned") {
      returnedOrders++;
    }
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalEarnings,
        totalOrders: orders.length,
        completedOrders,
        pendingOrders,
        returnedOrders,
        activeListings: productsCount,
        recentOrders: orders.slice(0, 8),
      },
      "Seller analytics retrieved"
    )
  );
});
