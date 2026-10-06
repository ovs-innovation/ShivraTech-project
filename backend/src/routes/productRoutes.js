import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  addProductReview,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/seller/my-products", protect, authorize("seller", "admin"), getSellerProducts);
router.get("/:slug", getProductBySlug);

// Private/Customer routes
router.post("/:id/reviews", protect, addProductReview);

// Private/Seller routes
router.post("/", protect, authorize("seller", "admin"), createProduct);
router.put("/:id", protect, authorize("seller", "admin"), updateProduct);
router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

export default router;
