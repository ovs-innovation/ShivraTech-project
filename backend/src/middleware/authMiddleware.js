import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "shivratech_secret");
    req.user = await User.findById(decoded.id).select("-password");
    
    if (!req.user) {
      throw new ApiError(401, "User belonging to this token no longer exists");
    }

    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized, token invalid or expired");
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `User role '${req.user.role}' is not authorized to access this route`);
    }
    next();
  };
};
