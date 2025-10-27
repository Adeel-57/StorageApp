import mongoose from "mongoose";

// Database connection function
// async function conectToDb(cb, dbPath) {
//   try {
//     await mongoose.connect(dbPath);
//     console.log("Connected to MongoDB successfully.");
//     cb(null);
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     cb(error);
//   }
// }

// Keep track of connection state (so we don't reconnect every time)
let isConnected = false;

async function conectToDb(callback, dbPath) {
  if (isConnected) {
    console.log("🔁 Using existing MongoDB connection");
    return callback?.(null);
  }

  try {
    const db = await mongoose.connect(dbPath, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ Connected to MongoDB successfully.");

    callback?.(null);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    callback?.(error);
  }
}

export { conectToDb };
