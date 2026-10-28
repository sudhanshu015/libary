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
exports.Reservation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ReservationSchema = new mongoose_1.Schema({
    bookId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Book",
        required: [true, "Book is required"],
    },
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Member",
        required: [true, "Member is required"],
    },
    reservationDate: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
        required: [true, "Expiry date is required"],
    },
    status: {
        type: String,
        enum: ["pending", "fulfilled", "cancelled", "expired"],
        default: "pending",
    },
    queuePosition: {
        type: Number,
        required: true,
        min: 1,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
ReservationSchema.index({ bookId: 1, status: 1 });
ReservationSchema.index({ memberId: 1 });
ReservationSchema.index({ status: 1 });
exports.Reservation = mongoose_1.default.model("Reservation", ReservationSchema);
//# sourceMappingURL=Reservation.js.map