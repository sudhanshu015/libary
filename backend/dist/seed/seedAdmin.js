"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const DEFAULT_ADMIN_EMAIL = "admin@library.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";
async function seedAdmin() {
    await (0, database_1.default)();
    const existingUser = await User_1.default.findOne({ email: DEFAULT_ADMIN_EMAIL.toLowerCase() });
    if (existingUser) {
        console.log(`✅ Default admin already exists: ${existingUser.email}`);
        return;
    }
    const admin = await User_1.default.create({
        name: "Admin",
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        role: "admin",
        isActive: true,
    });
    console.log(`✅ Default admin created: ${admin.email}`);
}
seedAdmin().catch((error) => {
    console.error("❌ Failed to seed default admin:", error);
    process.exitCode = 1;
});
//# sourceMappingURL=seedAdmin.js.map