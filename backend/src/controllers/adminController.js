import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Banner from "../models/Banner.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ===================== DASHBOARD ANALYTICS =====================

// @desc    Get platform-wide analytics overview
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalVendors,
    pendingVendors,
    totalProducts,
    totalOrders,
    allOrders,
    recentOrders,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "seller" }),
    User.countDocuments({ role: "seller", vendorStatus: "pending" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.find().select("totalAmount orderStatus paymentStatus createdAt"),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email"),
    User.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select("name email role createdAt isVerifiedSeller vendorStatus storeStatus storeName"),
  ]);

  let totalRevenue = 0;
  let pendingOrders = 0;
  let completedOrders = 0;
  let cancelledOrders = 0;

  const monthlySales = {};

  allOrders.forEach((order) => {
    if (order.orderStatus === "Delivered") {
      totalRevenue += order.totalAmount;
      completedOrders++;
    } else if (["Placed", "Accepted", "Packed", "Ready for Dispatch", "Shipped"].includes(order.orderStatus)) {
      pendingOrders++;
    } else if (order.orderStatus === "Cancelled") {
      cancelledOrders++;
    }

    // Monthly breakdown
    const month = new Date(order.createdAt).toLocaleString("en-IN", {
      month: "short",
      year: "2-digit",
    });
    if (!monthlySales[month]) monthlySales[month] = { revenue: 0, orders: 0 };
    monthlySales[month].orders += 1;
    if (order.orderStatus === "Delivered") {
      monthlySales[month].revenue += order.totalAmount;
    }
  });

  const monthlyData = Object.entries(monthlySales)
    .slice(-6)
    .map(([month, data]) => ({ month, ...data }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalUsers,
          totalVendors,
          pendingVendors,
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingOrders,
          completedOrders,
          cancelledOrders,
        },
        monthlyData,
        recentOrders,
        recentUsers,
      },
      "Admin analytics retrieved"
    )
  );
});

// ===================== USER MANAGEMENT =====================

// @desc    Get all users (with filters)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { storeName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, "Users retrieved")
  );
});

// @desc    Get single user by ID
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, user, "User retrieved"));
});

// @desc    Update user role / suspend / verify
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const { role, isVerifiedSeller, storeName, phone } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (role) user.role = role;
  if (isVerifiedSeller !== undefined) user.isVerifiedSeller = isVerifiedSeller;
  if (storeName !== undefined) user.storeName = storeName;
  if (phone !== undefined) user.phone = phone;
  await user.save();
  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

// @desc    Delete a user (and their products/orders optionally)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Cannot delete another admin");
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

// ===================== VENDOR MANAGEMENT & APPROVALS =====================

// @desc    Get all vendors with earnings, document status, and counts
// @route   GET /api/v1/admin/vendors
// @access  Private/Admin
export const getAllVendors = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = { role: "seller" };

  // Status filtering
  if (status && status !== "all") {
    if (status === "pending") {
      filter.$or = [
        { vendorStatus: "pending" },
        { vendorStatus: { $exists: false }, isVerifiedSeller: false },
      ];
    } else if (status === "approved" || status === "verified") {
      filter.$or = [
        { vendorStatus: "approved" },
        { isVerifiedSeller: true, vendorStatus: { $nin: ["suspended", "rejected"] } },
      ];
    } else if (status === "rejected") {
      filter.vendorStatus = "rejected";
    } else if (status === "suspended") {
      filter.vendorStatus = "suspended";
    }
  }

  // Keyword search
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { storeName: searchRegex },
      { phone: searchRegex },
      { gstNumber: searchRegex },
      { panNumber: searchRegex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [vendors, total, pendingCount, approvedCount, rejectedCount, suspendedCount, totalSellers] =
    await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
      User.countDocuments({
        role: "seller",
        $or: [{ vendorStatus: "pending" }, { vendorStatus: { $exists: false }, isVerifiedSeller: false }],
      }),
      User.countDocuments({
        role: "seller",
        $or: [{ vendorStatus: "approved" }, { isVerifiedSeller: true, vendorStatus: { $nin: ["suspended", "rejected"] } }],
      }),
      User.countDocuments({ role: "seller", vendorStatus: "rejected" }),
      User.countDocuments({ role: "seller", vendorStatus: "suspended" }),
      User.countDocuments({ role: "seller" }),
    ]);

  // Attach product count and earnings per vendor
  const vendorData = await Promise.all(
    vendors.map(async (v) => {
      const [productCount, orders] = await Promise.all([
        Product.countDocuments({ seller: v._id }),
        Order.find({ "items.seller": v._id }),
      ]);
      const earnings = orders
        .filter((o) => o.orderStatus === "Delivered")
        .reduce((sum, o) => sum + o.totalAmount, 0);

      // Derive normalized vendor status
      let currentVendorStatus = v.vendorStatus;
      if (!currentVendorStatus) {
        currentVendorStatus = v.isVerifiedSeller ? "approved" : "pending";
      }

      return {
        ...v.toObject(),
        vendorStatus: currentVendorStatus,
        storeStatus: v.storeStatus || (currentVendorStatus === "approved" ? "active" : "pending_approval"),
        productCount,
        totalOrders: orders.length,
        earnings,
      };
    })
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        vendors: vendorData,
        total,
        counts: {
          all: totalSellers,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          suspended: suspendedCount,
        },
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      "Vendors retrieved successfully"
    )
  );
});

// @desc    Get single vendor details by ID
// @route   GET /api/v1/admin/vendors/:id
// @access  Private/Admin
export const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== "seller") {
    throw new ApiError(404, "Vendor not found");
  }

  const [products, orders] = await Promise.all([
    Product.find({ seller: vendor._id }).limit(10),
    Order.find({ "items.seller": vendor._id }),
  ]);

  const totalEarnings = orders
    .filter((o) => o.orderStatus === "Delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        ...vendor.toObject(),
        productsCount: products.length,
        totalOrders: orders.length,
        totalEarnings,
        recentProducts: products,
      },
      "Vendor details retrieved"
    )
  );
});

// @desc    Approve a vendor
// @route   PUT /api/v1/admin/vendors/:id/approve
// @access  Private/Admin
export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== "seller") throw new ApiError(404, "Vendor not found");

  vendor.vendorStatus = "approved";
  vendor.storeStatus = "active";
  vendor.isVerifiedSeller = true;
  vendor.documentVerificationStatus = "verified";
  vendor.approvedAt = new Date();
  vendor.rejectionReason = "";
  vendor.suspensionReason = "";

  await vendor.save();
  res.status(200).json(new ApiResponse(200, vendor, "Vendor approved and store activated"));
});

// @desc    Reject a vendor registration
// @route   PUT /api/v1/admin/vendors/:id/reject
// @access  Private/Admin
export const rejectVendor = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== "seller") throw new ApiError(404, "Vendor not found");

  vendor.vendorStatus = "rejected";
  vendor.storeStatus = "rejected";
  vendor.isVerifiedSeller = false;
  vendor.documentVerificationStatus = "rejected";
  vendor.rejectedAt = new Date();
  vendor.rejectionReason = reason || "Verification documents could not be validated.";

  await vendor.save();
  res.status(200).json(new ApiResponse(200, vendor, "Vendor application rejected"));
});

// @desc    Suspend vendor
// @route   PUT /api/v1/admin/vendors/:id/suspend
// @access  Private/Admin
export const suspendVendor = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== "seller") throw new ApiError(404, "Vendor not found");

  vendor.vendorStatus = "suspended";
  vendor.storeStatus = "suspended";
  vendor.isVerifiedSeller = false;
  vendor.suspendedAt = new Date();
  vendor.suspensionReason = reason || "Suspended by administration.";

  await vendor.save();
  res.status(200).json(new ApiResponse(200, vendor, "Vendor store suspended"));
});

// @desc    Reactivate a suspended vendor
// @route   PUT /api/v1/admin/vendors/:id/reactivate
// @access  Private/Admin
export const reactivateVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== "seller") throw new ApiError(404, "Vendor not found");

  vendor.vendorStatus = "approved";
  vendor.storeStatus = "active";
  vendor.isVerifiedSeller = true;
  vendor.suspensionReason = "";

  await vendor.save();
  res.status(200).json(new ApiResponse(200, vendor, "Vendor store reactivated successfully"));
});

// @desc    Update vendor store status directly
// @route   PUT /api/v1/admin/vendors/:id/store-status
// @access  Private/Admin
export const updateVendorStoreStatus = asyncHandler(async (req, res) => {
  const { storeStatus, reason } = req.body;
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== "seller") throw new ApiError(404, "Vendor not found");

  const validStatuses = ["active", "pending_approval", "suspended", "rejected"];
  if (!validStatuses.includes(storeStatus)) {
    throw new ApiError(400, `Invalid store status. Must be one of: ${validStatuses.join(", ")}`);
  }

  vendor.storeStatus = storeStatus;

  if (storeStatus === "active") {
    vendor.vendorStatus = "approved";
    vendor.isVerifiedSeller = true;
    vendor.suspensionReason = "";
    vendor.rejectionReason = "";
  } else if (storeStatus === "suspended") {
    vendor.vendorStatus = "suspended";
    vendor.isVerifiedSeller = false;
    vendor.suspendedAt = new Date();
    if (reason) vendor.suspensionReason = reason;
  } else if (storeStatus === "rejected") {
    vendor.vendorStatus = "rejected";
    vendor.isVerifiedSeller = false;
    vendor.rejectedAt = new Date();
    if (reason) vendor.rejectionReason = reason;
  } else if (storeStatus === "pending_approval") {
    vendor.vendorStatus = "pending";
    vendor.isVerifiedSeller = false;
  }

  await vendor.save();
  res.status(200).json(new ApiResponse(200, vendor, `Store status updated to ${storeStatus}`));
});

// @desc    Verify or update document status for vendor
// @route   PUT /api/v1/admin/vendors/:id/verify-document
// @access  Private/Admin
export const verifyVendorDocument = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== "seller") throw new ApiError(404, "Vendor not found");

  if (!["verified", "rejected", "pending"].includes(status)) {
    throw new ApiError(400, "Invalid document verification status");
  }

  vendor.documentVerificationStatus = status;
  if (status === "rejected" && reason) {
    vendor.rejectionReason = reason;
  } else if (status === "verified") {
    vendor.rejectionReason = "";
  }

  await vendor.save();
  res.status(200).json(new ApiResponse(200, vendor, `Document status updated to ${status}`));
});

// ===================== PRODUCT MANAGEMENT =====================

// @desc    Get all products (admin view)
// @route   GET /api/v1/admin/products
// @access  Private/Admin
export const adminGetAllProducts = asyncHandler(async (req, res) => {
  const { keyword, category, seller, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { sellerName: { $regex: keyword, $options: "i" } },
    ];
  }
  if (category) filter.categorySlug = category;
  if (seller) filter.seller = seller;

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("seller", "name storeName isVerifiedSeller")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, "All products retrieved")
  );
});

// @desc    Admin remove a product
// @route   DELETE /api/v1/admin/products/:id
// @access  Private/Admin
export const adminDeleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(new ApiResponse(200, null, "Product removed by admin"));
});

// @desc    Admin update product (feature flags, category, etc.)
// @route   PUT /api/v1/admin/products/:id
// @access  Private/Admin
export const adminUpdateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(new ApiResponse(200, product, "Product updated by admin"));
});

// ===================== ORDER MANAGEMENT =====================

// @desc    Get all orders (admin view)
// @route   GET /api/v1/admin/orders
// @access  Private/Admin
export const adminGetAllOrders = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (search) {
    filter.$or = [
      { orderId: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
      { customerEmail: { $regex: search, $options: "i" } },
      { "items.title": { $regex: search, $options: "i" } },
      { "items.sellerName": { $regex: search, $options: "i" } },
      { "items.storeName": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [rawOrders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.seller", "name email storeName phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  const orders = rawOrders.map((order) => {
    const o = order.toObject();
    const storeNames = new Set();
    const vendors = [];

    o.items = (o.items || []).map((item) => {
      const sellerObj = item.seller;
      const storeName =
        item.storeName ||
        (sellerObj && typeof sellerObj === "object" ? sellerObj.storeName || sellerObj.name : null) ||
        item.sellerName ||
        "Shivra Store";

      const vendorName =
        (sellerObj && typeof sellerObj === "object" ? sellerObj.name : null) ||
        item.sellerName ||
        "Vendor";

      if (storeName) storeNames.add(storeName);
      vendors.push({
        storeName,
        vendorName,
        email: sellerObj?.email || "",
        phone: sellerObj?.phone || "",
      });

      return {
        ...item,
        storeName,
        vendorName,
      };
    });

    o.storeNames = Array.from(storeNames);
    o.primaryStoreName = o.storeNames[0] || "Shivra Store";
    o.vendors = vendors;
    return o;
  });

  res.status(200).json(
    new ApiResponse(200, { orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, "All orders retrieved")
  );
});

// @desc    Admin update order status
// @route   PUT /api/v1/admin/orders/:id/status
// @access  Private/Admin
export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, courierName, trackingNumber, trackingUrl } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (orderStatus) {
    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.paymentStatus = "Paid";
      order.isPaid = true;
    }
  }
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (courierName) order.courierName = courierName;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;

  await order.save();
  res.status(200).json(new ApiResponse(200, order, "Order updated by admin"));
});

// ===================== CATEGORY MANAGEMENT =====================

// @desc    Admin create category
// @route   POST /api/v1/admin/categories
// @access  Private/Admin
export const adminCreateCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(new ApiResponse(201, category, "Category created"));
});

// @desc    Admin update category
// @route   PUT /api/v1/admin/categories/:id
// @access  Private/Admin
export const adminUpdateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json(new ApiResponse(200, category, "Category updated"));
});

// @desc    Admin delete category
// @route   DELETE /api/v1/admin/categories/:id
// @access  Private/Admin
export const adminDeleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json(new ApiResponse(200, null, "Category deleted"));
});

// ===================== PAYMENTS & TRANSACTIONS MANAGEMENT =====================

// @desc    Get all transactions / payments with filters & KPIs
// @route   GET /api/v1/admin/transactions
// @access  Private/Admin
export const adminGetTransactions = asyncHandler(async (req, res) => {
  const { status, gateway, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status && status !== "all") {
    if (status === "paid" || status === "successful") {
      filter.paymentStatus = "Paid";
    } else if (status === "failed") {
      filter.paymentStatus = "Failed";
    } else if (status === "refunded") {
      filter.paymentStatus = "Refunded";
    } else if (status === "pending") {
      filter.paymentStatus = "Pending";
    }
  }

  if (gateway && gateway !== "all") {
    filter.gateway = { $regex: gateway, $options: "i" };
  }

  if (search) {
    const sRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { paymentId: sRegex },
      { orderId: sRegex },
      { customerName: sRegex },
      { customerEmail: sRegex },
      { refundId: sRegex },
      { "shippingAddress.phone": sRegex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total, allOrdersForStats] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.seller", "name email storeName phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
    Order.find().select("paymentStatus gatewayStatus totalAmount refundAmount"),
  ]);

  // Aggregate stats across all platform transactions
  let totalRevenue = 0;
  let totalRefunded = 0;
  let paidCount = 0;
  let failedCount = 0;
  let refundedCount = 0;
  let pendingCount = 0;

  allOrdersForStats.forEach((o) => {
    if (o.paymentStatus === "Paid") {
      totalRevenue += o.totalAmount || 0;
      paidCount++;
    } else if (o.paymentStatus === "Failed") {
      failedCount++;
    } else if (o.paymentStatus === "Refunded") {
      refundedCount++;
      totalRefunded += o.refundAmount || o.totalAmount || 0;
    } else if (o.paymentStatus === "Pending") {
      pendingCount++;
    }
  });

  const transactions = orders.map((o) => {
    const obj = o.toObject();
    // ensure paymentId exists for legacy records
    if (!obj.paymentId) {
      obj.paymentId = (obj.paymentMethod === "COD" ? "cod_" : "pay_rzp_") + String(obj._id).slice(-8);
    }
    if (!obj.gateway) {
      obj.gateway = obj.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay";
    }
    if (!obj.gatewayStatus) {
      obj.gatewayStatus =
        obj.paymentStatus === "Paid"
          ? "captured"
          : obj.paymentStatus === "Refunded"
          ? "refunded"
          : obj.paymentStatus === "Failed"
          ? "failed"
          : "pending";
    }

    const storeNames = new Set();
    (obj.items || []).forEach((item) => {
      const sName =
        item.storeName ||
        (item.seller && typeof item.seller === "object" ? item.seller.storeName || item.seller.name : null) ||
        item.sellerName;
      if (sName) storeNames.add(sName);
    });
    obj.storeNames = Array.from(storeNames);
    obj.primaryStoreName = obj.storeNames[0] || "Shivra Store";

    return obj;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        transactions,
        total,
        stats: {
          totalCount: allOrdersForStats.length,
          paidCount,
          failedCount,
          refundedCount,
          pendingCount,
          totalRevenue,
          totalRefunded,
        },
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      "Transactions retrieved successfully"
    )
  );
});

// @desc    Get single transaction by ID
// @route   GET /api/v1/admin/transactions/:id
// @access  Private/Admin
export const adminGetTransactionById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("items.seller", "name email storeName phone");
  if (!order) throw new ApiError(404, "Transaction record not found");

  const obj = order.toObject();
  if (!obj.paymentId) {
    obj.paymentId = (obj.paymentMethod === "COD" ? "cod_" : "pay_rzp_") + String(obj._id).slice(-8);
  }
  if (!obj.gateway) {
    obj.gateway = obj.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay";
  }
  if (!obj.gatewayStatus) {
    obj.gatewayStatus =
      obj.paymentStatus === "Paid"
        ? "captured"
        : obj.paymentStatus === "Refunded"
        ? "refunded"
        : obj.paymentStatus === "Failed"
        ? "failed"
        : "pending";
  }

  const storeNames = new Set();
  (obj.items || []).forEach((item) => {
    const sName =
      item.storeName ||
      (item.seller && typeof item.seller === "object" ? item.seller.storeName || item.seller.name : null) ||
      item.sellerName;
    if (sName) storeNames.add(sName);
  });
  obj.storeNames = Array.from(storeNames);
  obj.primaryStoreName = obj.storeNames[0] || "Shivra Store";

  res.status(200).json(new ApiResponse(200, obj, "Transaction details retrieved"));
});

// @desc    Process refund on a transaction
// @route   PUT /api/v1/admin/transactions/:id/refund
// @access  Private/Admin
export const adminRefundTransaction = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order/Transaction not found");

  if (order.paymentStatus === "Refunded") {
    throw new ApiError(400, "This payment is already refunded");
  }

  const refundAmt = Number(amount) || order.totalAmount;
  const refundId = `rfnd_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

  order.paymentStatus = "Refunded";
  order.gatewayStatus = "refunded";
  order.refundId = refundId;
  order.refundAmount = refundAmt;
  order.refundReason = reason || "Refund processed by administrator";
  order.refundedAt = new Date();
  if (order.orderStatus !== "Cancelled") {
    order.orderStatus = "Returned";
  }

  await order.save();
  res.status(200).json(new ApiResponse(200, order, `Refund of ₹${refundAmt} processed successfully`));
});

// @desc    Update payment and gateway status manually
// @route   PUT /api/v1/admin/transactions/:id/status
// @access  Private/Admin
export const adminUpdatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, gatewayStatus, failureReason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Transaction record not found");

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === "Paid") {
      order.isPaid = true;
      if (!order.paidAt) order.paidAt = new Date();
      order.gatewayStatus = gatewayStatus || "captured";
    } else if (paymentStatus === "Failed") {
      order.isPaid = false;
      order.gatewayStatus = gatewayStatus || "failed";
      if (failureReason) order.failureReason = failureReason;
    } else if (paymentStatus === "Refunded") {
      order.gatewayStatus = gatewayStatus || "refunded";
      if (!order.refundedAt) order.refundedAt = new Date();
    } else if (paymentStatus === "Pending") {
      order.isPaid = false;
      order.gatewayStatus = gatewayStatus || "pending";
    }
  }

  if (gatewayStatus) order.gatewayStatus = gatewayStatus;
  if (failureReason) order.failureReason = failureReason;

  await order.save();
  res.status(200).json(new ApiResponse(200, order, "Payment status updated successfully"));
});

// ===================== COUPONS & OFFERS MANAGEMENT =====================

// @desc    Get all coupons with stats, filters & pagination
// @route   GET /api/v1/admin/coupons
// @access  Private/Admin
export const adminGetCoupons = asyncHandler(async (req, res) => {
  const { type, status, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (type && type !== "all") {
    filter.type = type;
  }

  const now = new Date();
  if (status && status !== "all") {
    if (status === "expired") {
      filter.expiryDate = { $lt: now };
    } else if (status === "active") {
      filter.status = "active";
      filter.expiryDate = { $gte: now };
    } else if (status === "inactive") {
      filter.status = "inactive";
    }
  }

  if (search) {
    const sRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { code: sRegex },
      { title: sRegex },
      { description: sRegex },
      { storeName: sRegex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [coupons, total, allCoupons] = await Promise.all([
    Coupon.find(filter)
      .populate("vendor", "name email storeName phone")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Coupon.countDocuments(filter),
    Coupon.find().select("type status expiryDate usageCount"),
  ]);

  let platformCount = 0;
  let vendorCount = 0;
  let activeCount = 0;
  let expiredCount = 0;
  let totalRedemptions = 0;

  allCoupons.forEach((c) => {
    if (c.type === "platform") platformCount++;
    if (c.type === "vendor") vendorCount++;
    const isExp = c.expiryDate && new Date(c.expiryDate) < now;
    if (isExp) {
      expiredCount++;
    } else if (c.status === "active") {
      activeCount++;
    }
    totalRedemptions += c.usageCount || 0;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        coupons,
        total,
        stats: {
          totalCount: allCoupons.length,
          platformCount,
          vendorCount,
          activeCount,
          expiredCount,
          totalRedemptions,
        },
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      "Coupons retrieved successfully"
    )
  );
});

// @desc    Admin create coupon (Platform or Vendor)
// @route   POST /api/v1/admin/coupons
// @access  Private/Admin
export const adminCreateCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    title,
    description,
    type = "platform",
    vendor,
    discountType = "percentage",
    discountValue,
    maxDiscountAmount,
    minOrderAmount,
    startDate,
    expiryDate,
    usageLimit,
    perUserLimit,
    status = "active",
  } = req.body;

  if (!code || !discountValue || !expiryDate) {
    throw new ApiError(400, "Code, discount value, and expiry date are required");
  }

  const cleanCode = code.trim().toUpperCase();
  const existing = await Coupon.findOne({ code: cleanCode });
  if (existing) {
    throw new ApiError(400, `Coupon code "${cleanCode}" already exists`);
  }

  let storeName = "";
  let vendorId = null;

  if (type === "vendor") {
    if (!vendor) {
      throw new ApiError(400, "Vendor selection is required for vendor-specific coupons");
    }
    const vendorUser = await User.findById(vendor);
    if (!vendorUser) {
      throw new ApiError(404, "Selected vendor not found");
    }
    vendorId = vendorUser._id;
    storeName = vendorUser.storeName || vendorUser.name;
  }

  const coupon = await Coupon.create({
    code: cleanCode,
    title: title?.trim() || cleanCode,
    description: description?.trim() || "",
    type,
    vendor: vendorId,
    storeName,
    discountType,
    discountValue: Number(discountValue),
    maxDiscountAmount: Number(maxDiscountAmount || 0),
    minOrderAmount: Number(minOrderAmount || 0),
    startDate: startDate ? new Date(startDate) : new Date(),
    expiryDate: new Date(expiryDate),
    usageLimit: Number(usageLimit || 100),
    perUserLimit: Number(perUserLimit || 1),
    status,
    createdBy: req.user._id,
  });

  const populatedCoupon = await Coupon.findById(coupon._id)
    .populate("vendor", "name email storeName phone")
    .populate("createdBy", "name email");

  res.status(201).json(new ApiResponse(201, populatedCoupon, "Coupon created successfully"));
});

// @desc    Admin update coupon
// @route   PUT /api/v1/admin/coupons/:id
// @access  Private/Admin
export const adminUpdateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  const {
    code,
    title,
    description,
    type,
    vendor,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderAmount,
    startDate,
    expiryDate,
    usageLimit,
    perUserLimit,
    status,
  } = req.body;

  if (code) {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode !== coupon.code) {
      const existing = await Coupon.findOne({ code: cleanCode, _id: { $ne: coupon._id } });
      if (existing) throw new ApiError(400, `Coupon code "${cleanCode}" already exists`);
      coupon.code = cleanCode;
    }
  }

  if (title !== undefined) coupon.title = title;
  if (description !== undefined) coupon.description = description;

  if (type) {
    coupon.type = type;
    if (type === "platform") {
      coupon.vendor = null;
      coupon.storeName = "";
    }
  }

  if (vendor) {
    const vendorUser = await User.findById(vendor);
    if (vendorUser) {
      coupon.vendor = vendorUser._id;
      coupon.storeName = vendorUser.storeName || vendorUser.name;
    }
  }

  if (discountType) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
  if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(maxDiscountAmount);
  if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
  if (startDate) coupon.startDate = new Date(startDate);
  if (expiryDate) coupon.expiryDate = new Date(expiryDate);
  if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
  if (perUserLimit !== undefined) coupon.perUserLimit = Number(perUserLimit);
  if (status) coupon.status = status;

  await coupon.save();

  const populatedCoupon = await Coupon.findById(coupon._id)
    .populate("vendor", "name email storeName phone")
    .populate("createdBy", "name email");

  res.status(200).json(new ApiResponse(200, populatedCoupon, "Coupon updated successfully"));
});

// @desc    Admin delete coupon
// @route   DELETE /api/v1/admin/coupons/:id
// @access  Private/Admin
export const adminDeleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  res.status(200).json(new ApiResponse(200, null, "Coupon deleted successfully"));
});

// @desc    Admin quick toggle coupon status
// @route   PATCH /api/v1/admin/coupons/:id/toggle
// @access  Private/Admin
export const adminToggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  coupon.status = coupon.status === "active" ? "inactive" : "active";
  await coupon.save();

  res.status(200).json(new ApiResponse(200, coupon, `Coupon marked ${coupon.status}`));
});

// ===================== HOMEPAGE & SHOWCASE CONTENT =====================

// @desc    Admin quick toggle category featured status
// @route   PATCH /api/v1/admin/categories/:id/featured
// @access  Private/Admin
export const adminToggleCategoryFeatured = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  category.featured = !category.featured;
  await category.save();

  res.status(200).json(
    new ApiResponse(
      200,
      category,
      `Category "${category.name}" is now ${category.featured ? "featured on homepage" : "removed from featured"}`
    )
  );
});

// @desc    Admin quick update product homepage showcase flags (isFeatured, isFlashSale, isNewArrival)
// @route   PATCH /api/v1/admin/products/:id/showcase
// @access  Private/Admin
export const adminUpdateProductShowcase = asyncHandler(async (req, res) => {
  const { isFeatured, isFlashSale, isNewArrival } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
  if (isFlashSale !== undefined) product.isFlashSale = Boolean(isFlashSale);
  if (isNewArrival !== undefined) product.isNewArrival = Boolean(isNewArrival);

  await product.save();

  res.status(200).json(
    new ApiResponse(200, product, `Product "${product.title}" homepage showcase status updated`)
  );
});

// @desc    Get homepage content configuration overview (banners, showcase counts, featured categories)
// @route   GET /api/v1/admin/homepage/overview
// @access  Private/Admin
export const adminGetHomepageOverview = asyncHandler(async (req, res) => {
  const [
    heroBanners,
    promoBanners,
    topStrips,
    featuredCategories,
    featuredProducts,
    flashSaleProducts,
    newArrivalProducts,
  ] = await Promise.all([
    Banner.find({ bannerType: "hero" }).sort({ displayOrder: 1, createdAt: -1 }),
    Banner.find({ bannerType: "promo" }).sort({ displayOrder: 1, createdAt: -1 }),
    Banner.find({ bannerType: "top_strip" }).sort({ displayOrder: 1, createdAt: -1 }),
    Category.find({ featured: true }),
    Product.find({ isFeatured: true }).select("title slug price mrp mainImage images stock categoryName sellerName"),
    Product.find({ isFlashSale: true }).select("title slug price mrp mainImage images stock categoryName sellerName"),
    Product.find({ isNewArrival: true }).select("title slug price mrp mainImage images stock categoryName sellerName"),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        heroBanners,
        promoBanners,
        topStrips,
        featuredCategories,
        featuredProducts,
        flashSaleProducts,
        newArrivalProducts,
        counts: {
          heroBanners: heroBanners.length,
          promoBanners: promoBanners.length,
          topStrips: topStrips.length,
          featuredCategories: featuredCategories.length,
          featuredProducts: featuredProducts.length,
          flashSaleProducts: flashSaleProducts.length,
          newArrivalProducts: newArrivalProducts.length,
        },
      },
      "Homepage overview retrieved successfully"
    )
  );
});
