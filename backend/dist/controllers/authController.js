"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getMe = getMe;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const JWT_EXPIRES = "2h";
function signToken(id) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not set");
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: JWT_EXPIRES });
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and password are required" });
            return;
        }
        const user = await User_1.default.findOne({ email, isActive: true });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ success: false, message: "Invalid email or password" });
            return;
        }
        const token = signToken(String(user._id));
        res.json({
            success: true,
            data: {
                token,
                user: { _id: user._id, name: user.name, email: user.email, role: user.role },
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Login failed" });
    }
}
async function getMe(req, res) {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to get user" });
    }
}
async function logout(_req, res) {
    res.json({ success: true, data: null, message: "Logged out" });
}
//# sourceMappingURL=authController.js.map