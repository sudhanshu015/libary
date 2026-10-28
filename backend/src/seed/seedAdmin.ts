import dotenv from "dotenv";
import connectDB from "../config/database";
import User from "../models/User";

dotenv.config();

export const DEFAULT_ADMIN_EMAIL = "admin@library.com";
export const DEFAULT_ADMIN_PASSWORD = "admin123";

export async function seedDefaultAdmin(): Promise<void> {
  await connectDB();

  const existingUser = await User.findOne({ email: DEFAULT_ADMIN_EMAIL.toLowerCase() });
  if (existingUser) {
    console.log(`✅ Default admin already exists: ${existingUser.email}`);
    return;
  }

  const admin = await User.create({
    name: "Admin",
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    role: "admin",
    isActive: true,
  });

  console.log(`✅ Default admin created: ${admin.email}`);
}

if (require.main === module) {
  seedDefaultAdmin().catch((error) => {
    console.error("❌ Failed to seed default admin:", error);
    process.exitCode = 1;
  });
}
