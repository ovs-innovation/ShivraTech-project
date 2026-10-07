import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAdminAnalytics,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor,
  updateVendorStoreStatus,
  verifyVendorDocument,
  adminGetAllProducts,
  adminDeleteProduct,
  adminUpdateProduct,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetTransactions,
  adminGetTransactionById,
  adminRefundTransaction,
  adminUpdatePaymentStatus,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminToggleCouponStatus,
  adminToggleCategoryFeatured,
  adminUpdateProductShowcase,
  adminGetHomepageOverview,
} from "../controllers/adminController.js";
import {
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminToggleBanner,
  adminReorderBanners,
} from "../controllers/bannerController.js";
import { getCategories } from "../controllers/categoryController.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// ---- Analytics ----
router.get("/analytics", getAdminAnalytics);

// ---- User Management ----
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// ---- Vendor Management ----
router.get("/vendors", getAllVendors);
router.get("/vendors/:id", getVendorById);
router.put("/vendors/:id/approve", approveVendor);
router.put("/vendors/:id/reject", rejectVendor);
router.put("/vendors/:id/suspend", suspendVendor);
router.put("/vendors/:id/reactivate", reactivateVendor);
router.put("/vendors/:id/store-status", updateVendorStoreStatus);
router.put("/vendors/:id/verify-document", verifyVendorDocument);

// ---- Product Management ----
router.get("/products", adminGetAllProducts);
router.put("/products/:id", adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);

// ---- Order Management ----
router.get("/orders", adminGetAllOrders);
router.put("/orders/:id/status", adminUpdateOrderStatus);

// ---- Payments / Transactions Management ----
router.get("/transactions", adminGetTransactions);
router.get("/transactions/:id", adminGetTransactionById);
router.put("/transactions/:id/refund", adminRefundTransaction);
router.put("/transactions/:id/status", adminUpdatePaymentStatus);

// ---- Category Management ----
router.get("/categories", getCategories);
router.post("/categories", adminCreateCategory);
router.put("/categories/:id", adminUpdateCategory);
router.delete("/categories/:id", adminDeleteCategory);

// ---- Coupons & Offers Management ----
router.get("/coupons", adminGetCoupons);
router.post("/coupons", adminCreateCoupon);
router.put("/coupons/:id", adminUpdateCoupon);
router.delete("/coupons/:id", adminDeleteCoupon);
router.patch("/coupons/:id/toggle", adminToggleCouponStatus);

// ---- Banners & Homepage Content Management ----
router.get("/banners", adminGetBanners);
router.post("/banners", adminCreateBanner);
router.put("/banners/:id", adminUpdateBanner);
router.delete("/banners/:id", adminDeleteBanner);
router.patch("/banners/:id/toggle", adminToggleBanner);
router.patch("/banners/reorder", adminReorderBanners);

router.get("/homepage/overview", adminGetHomepageOverview);
router.patch("/categories/:id/featured", adminToggleCategoryFeatured);
router.patch("/products/:id/showcase", adminUpdateProductShowcase);

export default router;
