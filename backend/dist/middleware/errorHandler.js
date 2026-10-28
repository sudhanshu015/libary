"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
// 404 handler
const notFound = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};
exports.notFound = notFound;
// Global error handler
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // Mongoose validation error
    if (err.name === "ValidationError") {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: message,
        });
        return;
    }
    // Mongoose cast error (bad ObjectId)
    if (err.name === "CastError") {
        res.status(400).json({
            success: false,
            message: "Invalid ID format",
        });
        return;
    }
    // Duplicate key error
    if ("code" in err && err.code === "11000") {
        res.status(400).json({
            success: false,
            message: "Duplicate key error — this record already exists",
        });
        return;
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map