import connectDB from "../src/config/database";
import { seedDefaultAdmin } from "../src/seed/seedAdmin";
import app from "../src/app";

let initialization: Promise<void> | null = null;

const handler = async (req: any, res: any) => {
  if (!initialization) {
    initialization = Promise.resolve()
      .then(() => {
        if (process.env.VERCEL === "1") {
          const required = ["MONGODB_URI", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD", "FRONTEND_URL"];
          const missing = required.filter((name) => !process.env[name]);
          if (missing.length) {
            throw new Error(`Missing required Vercel environment variables: ${missing.join(", ")}`);
          }
        }
        return connectDB();
      })
      .then(seedDefaultAdmin)
      .catch((error) => {
        initialization = null;
        throw error;
      });
  }

  try {
    await initialization;
    return app(req, res);
  } catch (error) {
    console.error("API initialization failed:", error);
    return res.status(503).json({
      success: false,
      message: "API is unavailable. Check the database connection and deployment environment.",
    });
  }
};

export default handler;
