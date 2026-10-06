import dns from "dns";
import mongoose from "mongoose";

// Fix Windows / ISP DNS resolution issue for MongoDB Atlas SRV records (ECONNREFUSED)
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (err) {
  console.warn("[DNS Warning] Could not set custom DNS servers:", err.message);
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("[Database Error] MONGO_URI is missing in .env file.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    console.log("[Database Tip] Check if your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0 for dev).");
  }
};
