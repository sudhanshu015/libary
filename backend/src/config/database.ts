import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Cache connection across serverless function warm starts
let cached = (global as any).mongoose as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

let memoryServer: MongoMemoryServer | null = null;

const connectWithFallback = async (uri: string): Promise<typeof mongoose> => {
  try {
    return await mongoose.connect(uri, { bufferCommands: false });
  } catch (error) {
    const errorMessage = String(error ?? "");
    const shouldFallback = /ECONNREFUSED|ENOTFOUND|MongoNetworkError|MongoServerSelectionError|Timed out/.test(errorMessage);
    const isLocalUri = /localhost|127\.0\.0\.1/.test(uri);

    if (!shouldFallback || !isLocalUri) {
      throw error;
    }

    if (!memoryServer) {
      console.warn("⚠️ No local MongoDB instance detected. Starting an in-memory MongoDB instance instead.");
      memoryServer = await MongoMemoryServer.create({ instance: { dbName: "libraryos" } });
    }

    return mongoose.connect(memoryServer.getUri(), { bufferCommands: false });
  }
};

const connectDB = async (): Promise<void> => {
  if (cached.conn) return;

  if (process.env.VERCEL === "1" && !process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured for the Vercel deployment");
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/libraryos";

  if (!cached.promise) {
    cached.promise = connectWithFallback(uri).then((m) => {
      console.log(`✅ MongoDB Connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }

  mongoose.connection.on("disconnected", () => {
    cached.conn = null;
    cached.promise = null;
    console.warn("⚠️  MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
  });
};

export default connectDB;
