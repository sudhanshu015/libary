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
exports.Fine = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FineSchema = new mongoose_1.Schema({
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Member",
        required: [true, "Member is required"],
    },
    loanId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Loan",
        required: [true, "Loan is required"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"],
    },
    reason: {
        type: String,
        required: [true, "Reason is required"],
        enum: ["Overdue return", "Damaged book", "Lost book", "Other"],
        default: "Overdue return",
    },
    issuedDate: {
        type: Date,
        default: Date.now,
    },
    paidDate: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ["unpaid", "paid", "waived"],
        default: "unpaid",
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
FineSchema.index({ memberId: 1 });
FineSchema.index({ loanId: 1 });
FineSchema.index({ status: 1 });
exports.Fine = mongoose_1.default.model("Fine", FineSchema);
//# sourceMappingURL=Fine.js.map