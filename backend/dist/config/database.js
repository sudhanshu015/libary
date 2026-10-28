"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
// Cache connection across serverless function warm starts
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
let memoryServer = null;
const connectWithFallback = async (uri) => {
    try {
        return await mongoose_1.default.connect(uri, { bufferCommands: false });
    }
    catch (error) {
        const errorMessage = String(error ?? "");
        const shouldFallback = /ECONNREFUSED|ENOTFOUND|MongoNetworkError|MongoServerSelectionError|Timed out/.test(errorMessage);
        const isLocalUri = /localhost|127\.0\.0\.1/.test(uri);
        if (!shouldFallback || !isLocalUri) {
            throw error;
        }
        if (!memoryServer) {
            console.warn("⚠️ No local MongoDB instance detected. Starting an in-memory MongoDB instance instead.");
            memoryServer = await mongodb_memory_server_1.MongoMemoryServer.create({ instance: { dbName: "libraryos" } });
        }
        return mongoose_1.default.connect(memoryServer.getUri(), { bufferCommands: false });
    }
};
const connectDB = async () => {
    if (cached.conn)
        return;
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/libraryos";
    if (!cached.promise) {
        cached.promise = connectWithFallback(uri).then((m) => {
            console.log(`✅ MongoDB Connected: ${m.connection.host}`);
            return m;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (error) {
        cached.promise = null;
        console.error("❌ MongoDB connection error:", error);
        throw error;
    }
    mongoose_1.default.connection.on("disconnected", () => {
        cached.conn = null;
        cached.promise = null;
        console.warn("⚠️  MongoDB disconnected");
    });
    mongoose_1.default.connection.on("error", (err) => {
        console.error("MongoDB error:", err);
    });
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map