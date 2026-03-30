import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = global.__mongoose || { conn: null, promise: null };
global.__mongoose = cached;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env or environment");
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "agent_office",
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
