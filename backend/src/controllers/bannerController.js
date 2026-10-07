import Banner from "../models/Banner.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Default starter banners if none exist in the database yet
const DEFAULT_BANNERS = [
  {
    title: "Flagship Audio Launch 2026",
    subtitle: "Experience spatial ANC sound tuning with up to 40h battery endurance",
    badge: "NEW LAUNCH",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80",
    link: "/shop?category=audio",
    buttonText: "Shop Audio",
    bannerType: "hero",
    bgColor: "#4A0D4F",
    textColor: "#FFFFFF",
    displayOrder: 1,
    isActive: true,
  },
  {
    title: "Ultra Performance Laptops & Monitors",
    subtitle: "Built for developers, creator studios, and competitive gaming",
    badge: "TRENDING TECH",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
    link: "/shop?category=pc-accessories",
    buttonText: "Explore Gear",
    bannerType: "hero",
    bgColor: "#1E1B4B",
    textColor: "#FFFFFF",
    displayOrder: 2,
    isActive: true,
  },
  {
    title: "Flash Tech Deals — Up to 50% Off",
    subtitle: "Verified vendor products with 100% Buyer Protection & fast doorstep delivery",
    badge: "HOT PROMO",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
    link: "/shop",
    buttonText: "Claim Deals",
    bannerType: "promo",
    bgColor: "#2E1065",
    textColor: "#FFFFFF",
    displayOrder: 1,
    isActive: true,
  },
  {
    title: "FREE Express Delivery on all orders above ₹999 | Use Code SHARMA20 for 20% OFF",
    subtitle: "Limited time festive tech offer",
    badge: "ANNOUNCEMENT",
    image: "",
    link: "/shop",
    buttonText: "Shop Now",
    bannerType: "top_strip",
    bgColor: "#4A0D4F",
    textColor: "#FDF4FF",
    displayOrder: 1,
    isActive: true,
  },
];

// @desc    Get public active banners (auto-seeds defaults if empty)
// @route   GET /api/v1/banners
// @access  Public
export const getPublicBanners = asyncHandler(async (req, res) => {
  const { type } = req.query;

  // Auto-seed starter banners if collection is completely empty
  const count = await Banner.countDocuments();
  if (count === 0) {
    try {
      await Banner.insertMany(DEFAULT_BANNERS);
    } catch {
      // ignore concurrent seed race
    }
  }

  const now = new Date();
  const filter = {
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };

  if (type) {
    filter.bannerType = type;
  }

  const banners = await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, banners, "Banners retrieved successfully")
  );
});

// @desc    Record a banner click for analytics
// @route   POST /api/v1/banners/:id/click
// @access  Public
export const recordBannerClick = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    { $inc: { clickCount: 1 } },
    { new: true }
  );

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  res.status(200).json(new ApiResponse(200, { clicks: banner.clickCount }, "Click recorded"));
});

// @desc    Get all banners (Admin only, includes inactive and stats)
// @route   GET /api/v1/admin/banners
// @access  Private/Admin
export const adminGetBanners = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const filter = {};

  if (type && type !== "all") {
    filter.bannerType = type;
  }
  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  }

  const banners = await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 });

  // Quick stats
  const totalCount = await Banner.countDocuments();
  const activeCount = await Banner.countDocuments({ isActive: true });
  const heroCount = await Banner.countDocuments({ bannerType: "hero", isActive: true });
  const promoCount = await Banner.countDocuments({ bannerType: "promo", isActive: true });
  const totalClicks = banners.reduce((sum, b) => sum + (b.clickCount || 0), 0);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        banners,
        stats: {
          totalCount,
          activeCount,
          heroCount,
          promoCount,
          totalClicks,
        },
      },
      "Admin banners retrieved successfully"
    )
  );
});

// @desc    Create a banner (Admin only)
// @route   POST /api/v1/admin/banners
// @access  Private/Admin
export const adminCreateBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    badge,
    image,
    mobileImage,
    link,
    buttonText,
    bannerType,
    bgColor,
    textColor,
    displayOrder,
    isActive,
    startDate,
    endDate,
  } = req.body;

  // top_strip does not strictly require an image, but other types need image or title
  if (!image && !title && bannerType !== "top_strip") {
    throw new ApiError(400, "Please provide a banner image or headline");
  }

  const banner = await Banner.create({
    title: title || "",
    subtitle: subtitle || "",
    badge: badge || "",
    image: image || "",
    mobileImage: mobileImage || "",
    link: link || "/shop",
    buttonText: buttonText || "Shop Now",
    bannerType: bannerType || "hero",
    bgColor: bgColor || "#4A0D4F",
    textColor: textColor || "#FFFFFF",
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  res.status(201).json(new ApiResponse(201, banner, "Banner created successfully"));
});

// @desc    Update a banner (Admin only)
// @route   PUT /api/v1/admin/banners/:id
// @access  Private/Admin
export const adminUpdateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  const {
    title,
    subtitle,
    badge,
    image,
    mobileImage,
    link,
    buttonText,
    bannerType,
    bgColor,
    textColor,
    displayOrder,
    isActive,
    startDate,
    endDate,
  } = req.body;

  if (title !== undefined) banner.title = title;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (badge !== undefined) banner.badge = badge;
  if (image !== undefined) banner.image = image;
  if (mobileImage !== undefined) banner.mobileImage = mobileImage;
  if (link !== undefined) banner.link = link;
  if (buttonText !== undefined) banner.buttonText = buttonText;
  if (bannerType !== undefined) banner.bannerType = bannerType;
  if (bgColor !== undefined) banner.bgColor = bgColor;
  if (textColor !== undefined) banner.textColor = textColor;
  if (displayOrder !== undefined) banner.displayOrder = Number(displayOrder);
  if (isActive !== undefined) banner.isActive = Boolean(isActive);
  if (startDate !== undefined) banner.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) banner.endDate = endDate ? new Date(endDate) : null;

  await banner.save();

  res.status(200).json(new ApiResponse(200, banner, "Banner updated successfully"));
});

// @desc    Delete a banner (Admin only)
// @route   DELETE /api/v1/admin/banners/:id
// @access  Private/Admin
export const adminDeleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Banner deleted successfully"));
});

// @desc    Toggle banner active status (Admin only)
// @route   PATCH /api/v1/admin/banners/:id/toggle
// @access  Private/Admin
export const adminToggleBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  banner.isActive = !banner.isActive;
  await banner.save();

  res.status(200).json(new ApiResponse(200, banner, `Banner marked ${banner.isActive ? "active" : "inactive"}`));
});

// @desc    Reorder multiple banners (Admin only)
// @route   PATCH /api/v1/admin/banners/reorder
// @access  Private/Admin
export const adminReorderBanners = asyncHandler(async (req, res) => {
  const { orders } = req.body; // array of { id, displayOrder }
  if (!Array.isArray(orders)) {
    throw new ApiError(400, "Orders array is required");
  }

  const updates = orders.map(({ id, displayOrder }) =>
    Banner.findByIdAndUpdate(id, { displayOrder: Number(displayOrder) })
  );

  await Promise.all(updates);

  res.status(200).json(new ApiResponse(200, null, "Banner display order updated successfully"));
});
