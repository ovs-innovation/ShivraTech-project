import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAdminAnalytics,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllVendors,
  approveVendor,
  suspendVendor,
  adminGetAllProducts,
  adminDeleteProduct,
  adminUpdateProduct,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../controllers/adminController.js";
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
router.put("/vendors/:id/approve", approveVendor);
router.put("/vendors/:id/suspend", suspendVendor);

// ---- Product Management ----
router.get("/products", adminGetAllProducts);
router.put("/products/:id", adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);

// ---- Order Management ----
router.get("/orders", adminGetAllOrders);
router.put("/orders/:id/status", adminUpdateOrderStatus);

// ---- Category Management ----
router.get("/categories", getCategories);
router.post("/categories", adminCreateCategory);
router.put("/categories/:id", adminUpdateCategory);
router.delete("/categories/:id", adminDeleteCategory);

export default router;
