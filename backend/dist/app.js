"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("./middleware/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
// Routes
const auth_2 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const books_1 = __importDefault(require("./routes/books"));
const members_1 = __importDefault(require("./routes/members"));
const loans_1 = __importDefault(require("./routes/loans"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const fines_1 = __importDefault(require("./routes/fines"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ["http://localhost:5000", "http://localhost:5173", /\.replit\.dev$/, /\.repl\.co$/];
app.use((0, cors_1.default)({ origin: allowedOrigins, credentials: true }));
// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_1.requestLogger);
// ─── Trust proxy (required on Render / behind load balancer) ─────────────────
app.set("trust proxy", 1);
// ─── Rate limiters ────────────────────────────────────────────────────────────
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 200,
    message: { success: false, message: "Too many requests, please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", apiLimiter);
// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "LibraryOS API is running",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});
// ─── Public Routes ────────────────────────────────────────────────────────────
app.use("/api/auth", loginLimiter, auth_2.default);
// ─── Protected Routes ─────────────────────────────────────────────────────────
app.use("/api/users", users_1.default);
app.use("/api/dashboard", auth_1.authenticate, dashboard_1.default);
app.use("/api/books", auth_1.authenticate, books_1.default);
app.use("/api/members", auth_1.authenticate, members_1.default);
app.use("/api/loans", auth_1.authenticate, loans_1.default);
app.use("/api/reservations", auth_1.authenticate, reservations_1.default);
app.use("/api/fines", auth_1.authenticate, fines_1.default);
// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map