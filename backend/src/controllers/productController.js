import Product from "../models/Product.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get all products with filters, search, and pagination
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 20,
    featured,
    flashSale,
    newArrival,
  } = req.query;

  const filter = {};

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { shortDescription: { $regex: keyword, $options: "i" } },
      { categoryName: { $regex: keyword, $options: "i" } },
      { subcategory: { $regex: keyword, $options: "i" } },
      { brand: { $regex: keyword, $options: "i" } },
      { sku: { $regex: keyword, $options: "i" } },
      { keySpecifications: { $regex: keyword, $options: "i" } },
      { tags: { $in: [new RegExp(keyword, "i")] } },
    ];
  }

  if (category) {
    filter.categorySlug = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (featured === "true") filter.isFeatured = true;
  if (flashSale === "true") filter.isFlashSale = true;
  if (newArrival === "true") filter.isNewArrival = true;

  let sortOption = { createdAt: -1 };
  if (sort === "price-low") sortOption = { price: 1 };
  if (sort === "price-high") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { rating: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("seller", "name storeName phone")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      "Products retrieved successfully"
    )
  );
});

// @desc    Get single product by slug
// @route   GET /api/v1/products/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("seller", "name storeName phone avatar isVerifiedSeller")
    .populate("reviews.user", "name avatar");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json(new ApiResponse(200, product, "Product retrieved successfully"));
});

// @desc    Create a product (Vendor / Admin only)
// @route   POST /api/v1/products
// @access  Private/Seller
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    shortDescription,
    description,
    subcategory,
    brand,
    sku,
    price,
    mrp,
    categorySlug,
    categoryName,
    stock,
    spec,
    images,
    mainImage,
    weight,
    warranty,
    returnPolicy,
    keySpecifications,
    tags,
    isFeatured,
    isFlashSale,
    isNewArrival,
  } = req.body;

  const requiredFields = {
    "Product name": title,
    Category: categorySlug,
    Subcategory: subcategory,
    Brand: brand,
    "Selling price": price,
    MRP: mrp,
    "Stock quantity": stock,
    "Main image": mainImage,
    "Short description": shortDescription,
    "Full description": description,
    SKU: sku,
    "Key specifications": keySpecifications || spec,
    Weight: weight,
    Warranty: warranty,
    "Return policy": returnPolicy,
  };
  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => value === undefined || value === null || String(value).trim() === "")
    .map(([label]) => label);

  if (missingFields.length > 0) {
    throw new ApiError(400, `Required product details missing: ${missingFields.join(", ")}`);
  }

  const sellingPrice = Number(price);
  const mrpValue = Number(mrp);
  const stockQuantity = Number(stock);
  if (
    !Number.isFinite(sellingPrice) || sellingPrice < 0 ||
    !Number.isFinite(mrpValue) || mrpValue < 0 ||
    !Number.isInteger(stockQuantity) || stockQuantity < 0
  ) {
    throw new ApiError(400, "Enter valid prices and a non-negative whole stock quantity");
  }

  const galleryImages = Array.isArray(images)
    ? images.map((image) => String(image).trim()).filter(Boolean)
    : [];
  if (galleryImages.length < 2) {
    throw new ApiError(400, "At least 2 gallery images are required in addition to the main image");
  }

  const normalizedSku = String(sku).trim().toUpperCase();
  if (await Product.exists({ sku: normalizedSku })) {
    throw new ApiError(409, "A product with this SKU already exists");
  }

  // Generate unique slug from title
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  let slug = baseSlug;
  let counter = 1;

  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const product = await Product.create({
    title,
    slug,
    shortDescription,
    description,
    subcategory,
    brand,
    sku: normalizedSku,
    price: sellingPrice,
    mrp: mrpValue,
    categorySlug: categorySlug || "audio",
    categoryName: categoryName || "Audio",
    stock: stockQuantity,
    spec: keySpecifications || spec,
    keySpecifications: keySpecifications || spec,
    images: galleryImages,
    mainImage,
    weight,
    warranty,
    returnPolicy,
    tags: tags || [],
    isFeatured: isFeatured || false,
    isFlashSale: isFlashSale || false,
    isNewArrival: isNewArrival !== undefined ? isNewArrival : true,
    seller: req.user._id,
    sellerName: req.user.storeName || req.user.name,
  });

  res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

// @desc    Update product details (Vendor / Admin only)
// @route   PUT /api/v1/products/:id
// @access  Private/Seller
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check ownership
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to update this product");
  }

  const updates = { ...req.body };
  if (updates.sku) {
    updates.sku = String(updates.sku).trim().toUpperCase();
    if (await Product.exists({ sku: updates.sku, _id: { $ne: product._id } })) {
      throw new ApiError(409, "A product with this SKU already exists");
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

// @desc    Delete a product (Vendor / Admin only)
// @route   DELETE /api/v1/products/:id
// @access  Private/Seller
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to delete this product");
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

// @desc    Get products listed by currently logged in vendor
// @route   GET /api/v1/products/seller/my-products
// @access  Private/Seller
export const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, products, "Seller products retrieved"));
});

// @desc    Submit review & rating for a product
// @route   POST /api/v1/products/:id/reviews
// @access  Private
export const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json(new ApiResponse(201, product, "Review submitted successfully"));
});
