"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorizeAdmin = authorizeAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ success: false, message: "Server configuration error" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.default.findById(decoded.id).select("-password");
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: "User not found or deactivated" });
            return;
        }
        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}
function authorizeAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        res.status(403).json({ success: false, message: "Admin access required" });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map