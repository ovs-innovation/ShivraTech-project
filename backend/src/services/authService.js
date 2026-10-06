import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async ({ name, email, password, role, phone, storeName }) => {
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw new ApiError(400, "User already exists with this email");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || "customer",
    phone: phone || "",
    storeName: storeName || "",
  });

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeName: user.storeName,
    },
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeName: user.storeName,
    },
    token,
  };
};
