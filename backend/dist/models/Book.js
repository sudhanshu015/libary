"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BookSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    author: {
        type: String,
        required: [true, "Author is required"],
        trim: true,
    },
    isbn: {
        type: String,
        required: [true, "ISBN is required"],
        unique: true,
        trim: true,
    },
    genre: {
        type: String,
        required: [true, "Genre is required"],
        enum: ["Fiction", "Fantasy", "Dystopian", "Historical", "Romance", "Adventure", "Science", "Biography", "Other"],
    },
    publishedYear: {
        type: Number,
        required: [true, "Published year is required"],
        min: 1000,
        max: new Date().getFullYear(),
    },
    totalCopies: {
        type: Number,
        required: true,
        min: [1, "Must have at least 1 copy"],
        default: 1,
    },
    availableCopies: {
        type: Number,
        required: true,
        min: [0, "Available copies cannot be negative"],
        default: 1,
    },
    coverColor: {
        type: String,
        default: "#6366f1",
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Index for fast search
BookSchema.index({ title: "text", author: "text" });
BookSchema.index({ genre: 1 });
// Note: isbn unique index is already created via `unique: true` in the schema field definition
// Virtual: availability status
BookSchema.virtual("availabilityStatus").get(function () {
    if (this.availableCopies === 0)
        return "out_of_stock";
    if (this.availableCopies <= 1)
        return "low_stock";
    return "available";
});
// Custom validator: availableCopies <= totalCopies
BookSchema.path("availableCopies").validate(function (value) {
    return value <= this.totalCopies;
}, "Available copies cannot exceed total copies");
exports.Book = mongoose_1.default.model("Book", BookSchema);
//# sourceMappingURL=Book.js.map