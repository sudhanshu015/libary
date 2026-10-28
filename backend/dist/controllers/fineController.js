"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinesSummary = exports.waiveFine = exports.payFine = exports.createFine = exports.getFine = exports.getFines = void 0;
const Fine_1 = require("../models/Fine");
const Member_1 = require("../models/Member");
const Loan_1 = require("../models/Loan");
const getFines = async (req, res) => {
    try {
        const { search, status, page = "1", limit = "50" } = req.query;
        const query = {};
        if (status && typeof status === "string")
            query.status = status;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const skip = (pageNum - 1) * limitNum;
        const [fines, total] = await Promise.all([
            Fine_1.Fine.find(query)
                .populate("memberId", "name email")
                .populate({ path: "loanId", populate: { path: "bookId", select: "title" } })
                .sort({ issuedDate: -1 })
                .skip(skip)
                .limit(limitNum),
            Fine_1.Fine.countDocuments(query),
        ]);
        let data = fines.map((f) => {
            const member = f.memberId;
            const loan = f.loanId;
            return {
                ...f.toJSON(),
                memberName: member?.name || "",
                bookTitle: loan?.bookId?.title || "",
            };
        });
        if (search && typeof search === "string") {
            const s = search.toLowerCase();
            data = data.filter((f) => f.memberName.toLowerCase().includes(s) || f.bookTitle.toLowerCase().includes(s));
        }
        res.json({
            success: true,
            data,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to fetch fines" });
    }
};
exports.getFines = getFines;
const getFine = async (req, res) => {
    try {
        const fine = await Fine_1.Fine.findById(req.params.id)
            .populate("memberId", "name email phone")
            .populate({ path: "loanId", populate: { path: "bookId", select: "title author" } });
        if (!fine) {
            res.status(404).json({ success: false, message: "Fine not found" });
            return;
        }
        res.json({ success: true, data: fine });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to fetch fine" });
    }
};
exports.getFine = getFine;
const createFine = async (req, res) => {
    try {
        const { memberId, loanId, amount, reason } = req.body;
        const [member, loan] = await Promise.all([
            Member_1.Member.findById(memberId),
            Loan_1.Loan.findById(loanId),
        ]);
        if (!member) {
            res.status(404).json({ success: false, message: "Member not found" });
            return;
        }
        if (!loan) {
            res.status(404).json({ success: false, message: "Loan not found" });
            return;
        }
        const fine = await Fine_1.Fine.create({ memberId, loanId, amount, reason, status: "unpaid" });
        const populated = await Fine_1.Fine.findById(fine._id)
            .populate("memberId", "name email")
            .populate({ path: "loanId", populate: { path: "bookId", select: "title" } });
        res.status(201).json({ success: true, data: populated, message: "Fine created successfully" });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to create fine" });
    }
};
exports.createFine = createFine;
const payFine = async (req, res) => {
    try {
        const fine = await Fine_1.Fine.findById(req.params.id);
        if (!fine) {
            res.status(404).json({ success: false, message: "Fine not found" });
            return;
        }
        if (fine.status !== "unpaid") {
            res.status(400).json({ success: false, message: `Fine is already ${fine.status}` });
            return;
        }
        const updated = await Fine_1.Fine.findByIdAndUpdate(req.params.id, { status: "paid", paidDate: new Date() }, { new: true }).populate("memberId", "name").populate({ path: "loanId", populate: { path: "bookId", select: "title" } });
        res.json({ success: true, data: updated, message: "Fine marked as paid" });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to pay fine" });
    }
};
exports.payFine = payFine;
const waiveFine = async (req, res) => {
    try {
        const fine = await Fine_1.Fine.findById(req.params.id);
        if (!fine) {
            res.status(404).json({ success: false, message: "Fine not found" });
            return;
        }
        if (fine.status !== "unpaid") {
            res.status(400).json({ success: false, message: `Fine is already ${fine.status}` });
            return;
        }
        const updated = await Fine_1.Fine.findByIdAndUpdate(req.params.id, { status: "waived" }, { new: true }).populate("memberId", "name");
        res.json({ success: true, data: updated, message: "Fine waived" });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to waive fine" });
    }
};
exports.waiveFine = waiveFine;
const getFinesSummary = async (_req, res) => {
    try {
        const summary = await Fine_1.Fine.aggregate([
            { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]);
        res.json({ success: true, data: summary });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to fetch fines summary" });
    }
};
exports.getFinesSummary = getFinesSummary;
//# sourceMappingURL=fineController.js.map