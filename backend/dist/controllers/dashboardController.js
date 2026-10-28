"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowStockBooks = exports.getRecentLoans = exports.getLoansByGenre = exports.getLoansByMonth = exports.getDashboardStats = void 0;
const Book_1 = require("../models/Book");
const Member_1 = require("../models/Member");
const Loan_1 = require("../models/Loan");
const Reservation_1 = require("../models/Reservation");
const Fine_1 = require("../models/Fine");
// GET /api/dashboard/stats
const getDashboardStats = async (_req, res) => {
    try {
        // Auto-mark overdue
        await Loan_1.Loan.updateMany({ status: "active", dueDate: { $lt: new Date() } }, { $set: { status: "overdue" } });
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalBooks, totalMembers, activeLoans, overdueLoans, pendingReservations, finesAgg, newMembersThisMonth,] = await Promise.all([
            Book_1.Book.countDocuments(),
            Member_1.Member.countDocuments(),
            Loan_1.Loan.countDocuments({ status: "active" }),
            Loan_1.Loan.countDocuments({ status: "overdue" }),
            Reservation_1.Reservation.countDocuments({ status: "pending" }),
            Fine_1.Fine.aggregate([
                { $match: { status: "unpaid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Member_1.Member.countDocuments({ createdAt: { $gte: startOfMonth } }),
        ]);
        const totalFines = finesAgg[0]?.total ?? 0;
        res.json({
            success: true,
            data: {
                totalBooks,
                totalMembers,
                activeLoans,
                overdueLoans,
                pendingReservations,
                totalFines,
                newMembersThisMonth,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats", error });
    }
};
exports.getDashboardStats = getDashboardStats;
// GET /api/dashboard/loans-by-month  — last 6 months loan counts
const getLoansByMonth = async (_req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const data = await Loan_1.Loan.aggregate([
            { $match: { issueDate: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$issueDate" },
                        month: { $month: "$issueDate" },
                    },
                    loans: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const result = data.map((d) => ({
            month: months[d._id.month - 1],
            year: d._id.year,
            loans: d.loans,
        }));
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch loans by month", error });
    }
};
exports.getLoansByMonth = getLoansByMonth;
// GET /api/dashboard/loans-by-genre
const getLoansByGenre = async (_req, res) => {
    try {
        const data = await Loan_1.Loan.aggregate([
            {
                $lookup: {
                    from: "books",
                    localField: "bookId",
                    foreignField: "_id",
                    as: "book",
                },
            },
            { $unwind: "$book" },
            {
                $group: {
                    _id: "$book.genre",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        res.json({ success: true, data: data.map((d) => ({ genre: d._id, count: d.count })) });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch loans by genre", error });
    }
};
exports.getLoansByGenre = getLoansByGenre;
// GET /api/dashboard/recent-loans
const getRecentLoans = async (_req, res) => {
    try {
        const loans = await Loan_1.Loan.find()
            .populate("bookId", "title author coverColor")
            .populate("memberId", "name")
            .sort({ issueDate: -1 })
            .limit(5);
        const data = loans.map((l) => {
            const book = l.bookId;
            const member = l.memberId;
            return {
                ...l.toJSON(),
                bookTitle: book?.title || "",
                memberName: member?.name || "",
            };
        });
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch recent loans", error });
    }
};
exports.getRecentLoans = getRecentLoans;
// GET /api/dashboard/low-stock
const getLowStockBooks = async (_req, res) => {
    try {
        const books = await Book_1.Book.find({ availableCopies: { $lte: 1 } })
            .select("title availableCopies totalCopies")
            .sort({ availableCopies: 1 })
            .limit(5);
        res.json({ success: true, data: books });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch low stock books", error });
    }
};
exports.getLowStockBooks = getLowStockBooks;
//# sourceMappingURL=dashboardController.js.map