import mongoose from "mongoose";

// Database connection function
async function conectToDb(cb, dbPath) {
  try {
    await mongoose.connect(dbPath);
    console.log("Connected to MongoDB successfully.");
    cb(null);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cb(error);
  }
}

export { conectToDb };
