"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deactivateUser = deactivateUser;
const User_1 = __importDefault(require("../models/User"));
async function listUsers(_req, res) {
    try {
        const users = await User_1.default.find().select("-password").sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
}
async function createUser(req, res) {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: "Name, email, and password are required" });
            return;
        }
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            res.status(409).json({ success: false, message: "Email already in use" });
            return;
        }
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: role || "librarian",
            createdBy: req.user._id,
        });
        res.status(201).json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to create user" });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, role } = req.body;
        const user = await User_1.default.findByIdAndUpdate(id, { ...(name && { name }), ...(role && { role }) }, { new: true, runValidators: true }).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
}
async function deactivateUser(req, res) {
    try {
        const { id } = req.params;
        if (id === String(req.user._id)) {
            res.status(400).json({ success: false, message: "Cannot deactivate your own account" });
            return;
        }
        const user = await User_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true }).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to deactivate user" });
    }
}
//# sourceMappingURL=userController.js.map