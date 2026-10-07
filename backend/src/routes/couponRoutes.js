import { Router } from "express";
import {
  getActiveCoupons,
  validateCoupon,
  getVendorCoupons,
  createVendorCoupon,
  updateVendorCoupon,
  deleteVendorCoupon,
  toggleVendorCoupon,
} from "../controllers/couponController.js";
import { protect, authorize, optionalProtect } from "../middleware/authMiddleware.js";

const router = Router();

// Customer / Public routes
router.get("/active", getActiveCoupons);
router.post("/validate", optionalProtect, validateCoupon);

// Vendor / Seller routes
router.get("/vendor/my-coupons", protect, authorize("seller", "admin"), getVendorCoupons);
router.post("/vendor", protect, authorize("seller", "admin"), createVendorCoupon);
router.put("/vendor/:id", protect, authorize("seller", "admin"), updateVendorCoupon);
router.delete("/vendor/:id", protect, authorize("seller", "admin"), deleteVendorCoupon);
router.patch("/vendor/:id/toggle", protect, authorize("seller", "admin"), toggleVendorCoupon);

export default router;
