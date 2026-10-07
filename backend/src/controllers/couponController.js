import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ========================================================
// CUSTOMER & PUBLIC COUPON ENDPOINTS
// ========================================================

// @desc    Get active coupons for storefront / cart / offers drawer
// @route   GET /api/v1/coupons/active
// @access  Public
export const getActiveCoupons = asyncHandler(async (req, res) => {
  const { vendor, type } = req.query;
  const now = new Date();

  const filter = {
    status: "active",
    startDate: { $lte: now },
    expiryDate: { $gte: now },
    $expr: { $lt: ["$usageCount", "$usageLimit"] },
  };

  if (type && ["platform", "vendor"].includes(type)) {
    filter.type = type;
  }

  if (vendor) {
    filter.$or = [{ type: "platform" }, { vendor: vendor }];
  }

  const coupons = await Coupon.find(filter)
    .select(
      "code title description type vendor storeName discountType discountValue maxDiscountAmount minOrderAmount expiryDate usageLimit usageCount perUserLimit"
    )
    .populate("vendor", "name storeName")
    .sort({ type: 1, discountValue: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      coupons,
      `Retrieved ${coupons.length} active coupons`
    )
  );
});

// @desc    Validate and calculate coupon discount for cart / checkout
// @route   POST /api/v1/coupons/validate
// @access  Public / Optional Auth
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, items = [], subtotal = 0 } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    throw new ApiError(400, "Please provide a valid coupon code");
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon) {
    throw new ApiError(404, `Coupon code "${cleanCode}" does not exist`);
  }

  if (coupon.status !== "active") {
    throw new ApiError(400, `Coupon "${cleanCode}" is currently inactive`);
  }

  const now = new Date();
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    throw new ApiError(400, `Coupon "${cleanCode}" expired on ${new Date(coupon.expiryDate).toLocaleDateString()}`);
  }

  if (coupon.startDate && new Date(coupon.startDate) > now) {
    throw new ApiError(400, `Coupon "${cleanCode}" is not active yet`);
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new ApiError(400, `Coupon "${cleanCode}" has reached its total usage limit`);
  }

  // Check per-user limit if user is logged in
  if (req.user && coupon.perUserLimit) {
    const userUsage = coupon.usedBy?.find(
      (u) => u.user && u.user.toString() === req.user._id.toString()
    );
    if (userUsage && userUsage.count >= coupon.perUserLimit) {
      throw new ApiError(
        400,
        `You have already redeemed coupon "${cleanCode}" the maximum allowed times (${coupon.perUserLimit}x)`
      );
    }
  }

  let applicableSubtotal = Number(subtotal) || 0;
  let matchingItems = items;

  // For vendor-specific coupons, ensure cart has products from this vendor
  if (coupon.type === "vendor") {
    if (!coupon.vendor) {
      throw new ApiError(400, "Vendor coupon configuration error: no vendor assigned");
    }

    const couponVendorId = coupon.vendor.toString();
    const vendorStoreName = (coupon.storeName || "").toLowerCase().trim();

    // Enrich items with seller and storeName from database if missing
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        let seller = item.seller ? item.seller.toString() : "";
        let sellerName = item.sellerName || "";
        let storeName = item.storeName || "";

        if ((!seller || !storeName) && (item.slug || item.product || item._id)) {
          try {
            const query = [];
            if (item.slug) query.push({ slug: item.slug });
            if (item._id && mongoose.isValidObjectId(item._id)) query.push({ _id: item._id });
            if (item.product && mongoose.isValidObjectId(item.product)) query.push({ _id: item.product });

            if (query.length > 0) {
              const prod = await Product.findOne({ $or: query });
              if (prod) {
                if (!seller && prod.seller) seller = prod.seller.toString();
                if (!sellerName && prod.sellerName) sellerName = prod.sellerName;
                if (!storeName && prod.sellerName) storeName = prod.sellerName;
              }
            }
          } catch (err) {
            // ignore lookup error
          }
        }

        if (seller && !storeName) {
          try {
            const sellerUser = await User.findById(seller).select("storeName name");
            if (sellerUser) {
              storeName = sellerUser.storeName || sellerUser.name || "";
            }
          } catch (err) {}
        }

        return {
          ...item,
          seller,
          sellerName,
          storeName: storeName || sellerName,
        };
      })
    );

    matchingItems = enrichedItems.filter((item) => {
      const itemSeller = item.seller ? item.seller.toString() : "";
      const itemStore = (item.storeName || item.sellerName || "").toLowerCase().trim();
      return (
        itemSeller === couponVendorId ||
        (vendorStoreName && itemStore === vendorStoreName) ||
        (vendorStoreName && itemStore.includes(vendorStoreName)) ||
        (vendorStoreName && vendorStoreName.includes(itemStore) && itemStore.length >= 3)
      );
    });

    if (matchingItems.length === 0) {
      throw new ApiError(
        400,
        `Coupon "${cleanCode}" is exclusive to items from "${coupon.storeName || "this vendor"}". Add items from this seller to apply.`
      );
    }

    // Applicable subtotal is only the items from this vendor
    applicableSubtotal = matchingItems.reduce((sum, item) => {
      const price = typeof item.price === "number" ? item.price : Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }

  // Validate Minimum Order Amount
  if (coupon.minOrderAmount && applicableSubtotal < coupon.minOrderAmount) {
    const contextText = coupon.type === "vendor" ? ` for ${coupon.storeName} items` : "";
    throw new ApiError(
      400,
      `Minimum purchase amount of ₹${coupon.minOrderAmount} required${contextText} to apply "${cleanCode}"`
    );
  }

  // Calculate Discount Amount
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (applicableSubtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === "fixed") {
    discountAmount = Math.min(coupon.discountValue, applicableSubtotal);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;
  const newTotal = Math.max(0, Math.round((Number(subtotal) - discountAmount) * 100) / 100);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        valid: true,
        couponId: coupon._id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        type: coupon.type,
        vendor: coupon.vendor,
        storeName: coupon.storeName,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minOrderAmount: coupon.minOrderAmount,
        discountAmount,
        applicableSubtotal,
        newTotal,
        message: `Coupon "${cleanCode}" applied! You save ₹${discountAmount.toLocaleString("en-IN")}`,
      },
      "Coupon validated successfully"
    )
  );
});

// ========================================================
// VENDOR / SELLER COUPON MANAGEMENT ENDPOINTS
// ========================================================

// @desc    Get all coupons created by the logged-in vendor
// @route   GET /api/v1/coupons/vendor/my-coupons
// @access  Private / Seller
export const getVendorCoupons = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;

  const coupons = await Coupon.find({ vendor: vendorId }).sort({ createdAt: -1 });

  const now = new Date();
  let activeCount = 0;
  let expiredCount = 0;
  let totalRedemptions = 0;

  coupons.forEach((c) => {
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
        stats: {
          totalCount: coupons.length,
          activeCount,
          expiredCount,
          totalRedemptions,
        },
      },
      "Vendor coupons retrieved"
    )
  );
});

// @desc    Vendor create a new store coupon
// @route   POST /api/v1/coupons/vendor
// @access  Private / Seller
export const createVendorCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    title,
    description,
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
    throw new ApiError(400, `Coupon code "${cleanCode}" already exists on the platform`);
  }

  const storeName = req.user.storeName || req.user.name || "Vendor Store";

  const coupon = await Coupon.create({
    code: cleanCode,
    title: title?.trim() || `${cleanCode} - ${storeName}`,
    description: description?.trim() || `Exclusive offer for ${storeName}`,
    type: "vendor",
    vendor: req.user._id,
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

  res.status(201).json(new ApiResponse(201, coupon, "Vendor coupon created successfully"));
});

// @desc    Vendor update their own coupon
// @route   PUT /api/v1/coupons/vendor/:id
// @access  Private / Seller
export const updateVendorCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  if (coupon.vendor?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to update this coupon");
  }

  const {
    code,
    title,
    description,
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

  res.status(200).json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

// @desc    Vendor delete their own coupon
// @route   DELETE /api/v1/coupons/vendor/:id
// @access  Private / Seller
export const deleteVendorCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  if (coupon.vendor?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to delete this coupon");
  }

  await Coupon.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Vendor coupon deleted successfully"));
});

// @desc    Vendor toggle coupon status (active / inactive)
// @route   PATCH /api/v1/coupons/vendor/:id/toggle
// @access  Private / Seller
export const toggleVendorCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  if (coupon.vendor?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to modify this coupon");
  }

  coupon.status = coupon.status === "active" ? "inactive" : "active";
  await coupon.save();

  res.status(200).json(
    new ApiResponse(200, coupon, `Coupon marked ${coupon.status}`)
  );
});
