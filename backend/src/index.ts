import dotenv from "dotenv";
import connectDB from "./config/database";
import app from "./app";
import { seedDefaultAdmin } from "./seed/seedAdmin";

dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async (): Promise<void> => {
  await connectDB();
  await seedDefaultAdmin();
  app.listen(PORT, () => {
    console.log(`\n🚀 LibraryOS API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n📌 Endpoints:`);
    console.log(`   GET  /api/dashboard/stats`);
    console.log(`   GET  /api/books`);
    console.log(`   GET  /api/members`);
    console.log(`   GET  /api/loans`);
    console.log(`   GET  /api/reservations`);
    console.log(`   GET  /api/fines`);
  });
};

startServer();

export default app;
