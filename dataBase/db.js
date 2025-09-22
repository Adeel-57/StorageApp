import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Database connection function
async function conectToDb(cb, dbPath) {
  if (cached.conn) {
    return cb(null);
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(dbPath).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
    cb(null);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cb(error);
  }
}

export { conectToDb };
