import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const router = Router();

// @desc    Upload single image
// @route   POST /api/v1/upload
// @access  Private/Seller
router.post("/", protect, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Please upload an image file");
    }

    let imageUrl;

    // Check if Cloudinary credentials are provided
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "shivratech/products",
      });
      imageUrl = result.secure_url;
      // Delete temporary local file
      fs.unlink(req.file.path, () => {});
    } else {
      // Local URL
      const protocol = req.protocol;
      const host = req.get("host");
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          url: imageUrl,
          filename: req.file.filename,
          size: req.file.size,
        },
        "Image uploaded successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

// @desc    Upload multiple images
// @route   POST /api/v1/upload/multiple
// @access  Private/Seller
router.post("/multiple", protect, upload.array("images", 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "Please upload at least one image file");
    }

    const protocol = req.protocol;
    const host = req.get("host");

    const urls = req.files.map((file) => `${protocol}://${host}/uploads/${file.filename}`);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          urls,
          count: urls.length,
        },
        "Images uploaded successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

export default router;
