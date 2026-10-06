import Order from "../models/Order.js";
import { ApiError } from "../utils/apiResponse.js";

export const createOrderService = async (userId, orderData) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalAmount,
  } = orderData;

  if (!items || items.length === 0) {
    throw new ApiError(400, "No order items provided");
  }

  const order = await Order.create({
    user: userId,
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalAmount,
  });

  return order;
};

export const getOrderByIdService = async (orderId, userId) => {
  const order = await Order.findById(orderId).populate("user", "name email phone");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return order;
};
