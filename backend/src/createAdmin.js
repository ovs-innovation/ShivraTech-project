import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

const setupAdmin = async () => {
  try {
    await connectDB();
    const adminEmail = "admin@shivratech.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: "adminpassword123",
        role: "admin",
        phone: "+91 99999 88888",
      });
      console.log(`[Admin] Created admin account: ${adminEmail} / adminpassword123`);
    } else {
      if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
        console.log(`[Admin] Updated user ${adminEmail} to role: admin`);
      } else {
        console.log(`[Admin] Admin account already exists: ${adminEmail}`);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error("[Admin Setup Error]", error.message);
    process.exit(1);
  }
};

setupAdmin();
