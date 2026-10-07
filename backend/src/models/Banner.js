import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    mobileImage: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "/shop",
      trim: true,
    },
    buttonText: {
      type: String,
      default: "Shop Now",
      trim: true,
    },
    bannerType: {
      type: String,
      enum: ["hero", "promo", "top_strip", "category_feature", "sidebar"],
      default: "hero",
      index: true,
    },
    bgColor: {
      type: String,
      default: "#4A0D4F",
    },
    textColor: {
      type: String,
      default: "#FFFFFF",
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if banner is currently valid by schedule
bannerSchema.methods.isScheduleValid = function () {
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
};

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
