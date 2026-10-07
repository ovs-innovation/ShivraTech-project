import { Router } from "express";
import {
  getPublicBanners,
  recordBannerClick,
} from "../controllers/bannerController.js";

const router = Router();

// Public routes for customer storefront
router.get("/", getPublicBanners);
router.post("/:id/click", recordBannerClick);

export default router;
