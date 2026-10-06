import { Router } from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import orderRoutes from "./orderRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/upload", uploadRoutes);
router.use("/admin", adminRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "ShivraTech E-Commerce API is running smoothly.",
    timestamp: new Date().toISOString(),
  });
});

export default router;
