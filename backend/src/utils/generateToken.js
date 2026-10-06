import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "shivratech_secret", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};
