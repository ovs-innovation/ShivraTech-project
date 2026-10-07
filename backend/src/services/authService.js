import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import { generateToken } from "../utils/generateToken.js";

const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  avatar: user.avatar || "",
  storeName: user.storeName || "",
  isVerifiedSeller: user.isVerifiedSeller ?? false,
  vendorStatus: user.vendorStatus || (user.role === "seller" ? "pending" : "approved"),
  storeStatus: user.storeStatus || (user.role === "seller" ? "pending_approval" : "active"),
  businessType: user.businessType || "Individual / Sole Proprietor",
  businessAddress: user.businessAddress || "",
  gstNumber: user.gstNumber || "",
  panNumber: user.panNumber || "",
  idProofUrl: user.idProofUrl || "",
  idProofType: user.idProofType || "Aadhaar / Voter ID / Passport",
  businessDocUrl: user.businessDocUrl || "",
  businessDocType: user.businessDocType || "GST Certificate / Business License",
  documentVerificationStatus: user.documentVerificationStatus || (user.role === "seller" ? "pending" : "unsubmitted"),
  rejectionReason: user.rejectionReason || "",
  suspensionReason: user.suspensionReason || "",
  createdAt: user.createdAt,
});

export const registerUser = async ({
  name,
  email,
  password,
  role,
  phone,
  storeName,
  businessType,
  businessAddress,
  gstNumber,
  panNumber,
  idProofUrl,
  idProofType,
  businessDocUrl,
  businessDocType,
}) => {
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw new ApiError(400, "User already exists with this email");
  }

  const isSeller = role === "seller";

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || "customer",
    phone: phone || "",
    storeName: storeName || "",
    businessType: businessType || "Individual / Sole Proprietor",
    businessAddress: businessAddress || "",
    gstNumber: gstNumber || "",
    panNumber: panNumber || "",
    idProofUrl: idProofUrl || "",
    idProofType: idProofType || "Aadhaar / Voter ID / Passport",
    businessDocUrl: businessDocUrl || "",
    businessDocType: businessDocType || "GST Certificate / Business License",
    vendorStatus: isSeller ? "pending" : "approved",
    storeStatus: isSeller ? "pending_approval" : "active",
    isVerifiedSeller: false,
    documentVerificationStatus: isSeller ? (idProofUrl || businessDocUrl || gstNumber ? "pending" : "unsubmitted") : "unsubmitted",
  });

  const token = generateToken(user._id);

  return {
    user: formatUserResponse(user),
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
    user: formatUserResponse(user),
    token,
  };
};
