import dotenv from "dotenv";
import connectDB from "../config/database";
import User from "../models/User";

dotenv.config();

export const DEFAULT_ADMIN_EMAIL = "admin@library.com";
export const DEFAULT_ADMIN_PASSWORD = "admin123";

export async function seedDefaultAdmin(): Promise<void> {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    console.log(`✅ Default admin already exists: ${existingUser.email}`);
    return;
  }

  const admin = await User.create({
    name: "Admin",
    email,
    password,
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
