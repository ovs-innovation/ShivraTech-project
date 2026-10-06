import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
  returnOrder,
  getSellerOrders,
  updateOrderStatus,
  getSellerAnalytics,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Customer Order Routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return", protect, returnOrder);

// Vendor Order & Analytics Routes
router.get("/seller/my-orders", protect, authorize("seller", "admin"), getSellerOrders);
router.get("/seller/analytics", protect, authorize("seller", "admin"), getSellerAnalytics);
router.put("/:id/status", protect, authorize("seller", "admin"), updateOrderStatus);

// Single order detail route
router.get("/:id", protect, getOrderById);

export default router;
