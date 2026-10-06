import User from "../models/User.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUser, loginUser } from "../services/authService.js";

// @desc    Register new Customer or Vendor
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(new ApiResponse(201, result, "User registered successfully"));
});

// @desc    Login Customer or Vendor
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});

// @desc    Get logged in user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "User profile retrieved"));
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, storeName, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (storeName) user.storeName = storeName;
  if (avatar) user.avatar = avatar;

  await user.save();
  res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});
