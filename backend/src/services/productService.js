import Product from "../models/Product.js";
import { ApiError } from "../utils/apiResponse.js";

export const getProductsService = async (query = {}) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = query;

  const filter = {};

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { categoryName: { $regex: keyword, $options: "i" } },
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

  let sortOption = { createdAt: -1 };
  if (sort === "price-low") sortOption = { price: 1 };
  if (sort === "price-high") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { rating: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  };
};

export const getProductBySlugService = async (slug) => {
  const product = await Product.findOne({ slug }).populate("seller", "name storeName phone");
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};
