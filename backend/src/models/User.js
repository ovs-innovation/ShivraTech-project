import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    phone: {
      type: String,
      default: "",
    },
    storeName: {
      type: String,
      default: "",
    },
    isVerifiedSeller: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    // Vendor Approval & Verification Fields
    vendorStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: function () {
        return this.role === "seller" ? "pending" : "approved";
      },
    },
    storeStatus: {
      type: String,
      enum: ["active", "pending_approval", "suspended", "rejected"],
      default: function () {
        return this.role === "seller" ? "pending_approval" : "active";
      },
    },
    businessType: {
      type: String,
      default: "Individual / Sole Proprietor",
    },
    businessAddress: {
      type: String,
      default: "",
    },
    gstNumber: {
      type: String,
      default: "",
      trim: true,
    },
    panNumber: {
      type: String,
      default: "",
      trim: true,
    },
    idProofUrl: {
      type: String,
      default: "",
    },
    idProofType: {
      type: String,
      default: "Aadhaar / Voter ID / Passport",
    },
    businessDocUrl: {
      type: String,
      default: "",
    },
    businessDocType: {
      type: String,
      default: "GST Certificate / Business License",
    },
    documentVerificationStatus: {
      type: String,
      enum: ["unsubmitted", "pending", "verified", "rejected"],
      default: function () {
        return this.role === "seller" ? "pending" : "unsubmitted";
      },
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    suspensionReason: {
      type: String,
      default: "",
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    suspendedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
