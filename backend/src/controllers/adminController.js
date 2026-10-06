import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
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
    totalProducts,
    totalOrders,
    allOrders,
    recentOrders,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "seller" }),
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
      .select("name email role createdAt isVerifiedSeller storeName"),
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

// ===================== VENDOR MANAGEMENT =====================

// @desc    Get all vendors with earnings
// @route   GET /api/v1/admin/vendors
// @access  Private/Admin
export const getAllVendors = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = { role: "seller" };
  if (status === "verified") filter.isVerifiedSeller = true;
  if (status === "pending") filter.isVerifiedSeller = false;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { storeName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [vendors, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
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
      return {
        ...v.toObject(),
        productCount,
        totalOrders: orders.length,
        earnings,
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, { vendors: vendorData, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, "Vendors retrieved")
  );
});

// @desc    Approve or reject a vendor
// @route   PUT /api/v1/admin/vendors/:id/approve
// @access  Private/Admin
export const approveVendor = asyncHandler(async (req, res) => {
  const { approved } = req.body;
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== "seller") throw new ApiError(404, "Vendor not found");
  vendor.isVerifiedSeller = Boolean(approved);
  await vendor.save();
  res.status(200).json(new ApiResponse(200, vendor, approved ? "Vendor approved" : "Vendor rejected"));
});

// @desc    Suspend vendor (set role to 'customer')
// @route   PUT /api/v1/admin/vendors/:id/suspend
// @access  Private/Admin
export const suspendVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.params.id);
  if (!vendor) throw new ApiError(404, "Vendor not found");
  vendor.role = "customer";
  vendor.isVerifiedSeller = false;
  await vendor.save();
  res.status(200).json(new ApiResponse(200, vendor, "Vendor suspended and reverted to customer"));
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
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

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
