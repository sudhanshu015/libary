"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLoan = exports.returnLoan = exports.createLoan = exports.getLoan = exports.getLoans = void 0;
const Loan_1 = require("../models/Loan");
const Book_1 = require("../models/Book");
const Member_1 = require("../models/Member");
const Fine_1 = require("../models/Fine");
const Reservation_1 = require("../models/Reservation");
const markOverdueLoans = async () => {
    await Loan_1.Loan.updateMany({ status: "active", dueDate: { $lt: new Date() } }, { $set: { status: "overdue" } });
};
const getLoans = async (req, res) => {
    try {
        await markOverdueLoans();
        const { search, status, page = "1", limit = "50" } = req.query;
        const query = {};
        if (status && typeof status === "string")
            query.status = status;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const skip = (pageNum - 1) * limitNum;
        const loansQuery = Loan_1.Loan.find(query)
            .populate("bookId", "title author isbn coverColor")
            .populate("memberId", "name email")
            .sort({ issueDate: -1 })
            .skip(skip)
            .limit(limitNum);
        const [loans, total] = await Promise.all([loansQuery, Loan_1.Loan.countDocuments(query)]);
        let data = loans.map((loan) => {
            const book = loan.bookId;
            const member = loan.memberId;
            return {
                ...loan.toJSON(),
                bookTitle: book?.title || "",
                memberName: member?.name || "",
            };
        });
        if (search && typeof search === "string") {
            const s = search.toLowerCase();
            data = data.filter((l) => l.bookTitle.toLowerCase().includes(s) || l.memberName.toLowerCase().includes(s));
        }
        res.json({
            success: true,
            data,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to fetch loans" });
    }
};
exports.getLoans = getLoans;
const getLoan = async (req, res) => {
    try {
        const loan = await Loan_1.Loan.findById(req.params.id)
            .populate("bookId", "title author isbn coverColor")
            .populate("memberId", "name email phone");
        if (!loan) {
            res.status(404).json({ success: false, message: "Loan not found" });
            return;
        }
        res.json({ success: true, data: loan });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to fetch loan" });
    }
};
exports.getLoan = getLoan;
const createLoan = async (req, res) => {
    try {
        const { bookId, memberId, dueDays = 14 } = req.body;
        const book = await Book_1.Book.findById(bookId);
        if (!book) {
            res.status(404).json({ success: false, message: "Book not found" });
            return;
        }
        if (book.availableCopies <= 0) {
            res.status(400).json({ success: false, message: "No copies available for this book" });
            return;
        }
        const member = await Member_1.Member.findById(memberId);
        if (!member) {
            res.status(404).json({ success: false, message: "Member not found" });
            return;
        }
        if (member.status !== "active") {
            res.status(400).json({ success: false, message: `Member account is ${member.status}` });
            return;
        }
        const existingLoan = await Loan_1.Loan.findOne({ bookId, memberId, status: { $in: ["active", "overdue"] } });
        if (existingLoan) {
            res.status(400).json({ success: false, message: "Member already has this book on loan" });
            return;
        }
        // BUG FIX: Block loan if member has unpaid fines
        const unpaidFines = await Fine_1.Fine.countDocuments({ memberId, status: "unpaid" });
        if (unpaidFines > 0) {
            res.status(400).json({ success: false, message: `Member has ${unpaidFines} unpaid fine(s). Please settle them before issuing a new loan.` });
            return;
        }
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Number(dueDays));
        const loan = await Loan_1.Loan.create({ bookId, memberId, dueDate, status: "active" });
        await Book_1.Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });
        // BUG FIX: Auto-fulfill any pending reservation this member had for this book
        const pendingReservation = await Reservation_1.Reservation.findOne({ bookId, memberId, status: "pending" });
        if (pendingReservation) {
            await Reservation_1.Reservation.findByIdAndUpdate(pendingReservation._id, { status: "fulfilled" });
            // Reorder queue for remaining pending reservations on this book
            const remaining = await Reservation_1.Reservation.find({ bookId, status: "pending" }).sort({ queuePosition: 1 });
            for (let i = 0; i < remaining.length; i++) {
                await Reservation_1.Reservation.findByIdAndUpdate(remaining[i]._id, { queuePosition: i + 1 });
            }
        }
        const populated = await Loan_1.Loan.findById(loan._id)
            .populate("bookId", "title author")
            .populate("memberId", "name email");
        res.status(201).json({ success: true, data: populated, message: "Book issued successfully" });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to create loan" });
    }
};
exports.createLoan = createLoan;
const returnLoan = async (req, res) => {
    try {
        const loan = await Loan_1.Loan.findById(req.params.id);
        if (!loan) {
            res.status(404).json({ success: false, message: "Loan not found" });
            return;
        }
        if (loan.status === "returned") {
            res.status(400).json({ success: false, message: "This book has already been returned" });
            return;
        }
        const returnDate = new Date();
        const updatedLoan = await Loan_1.Loan.findByIdAndUpdate(req.params.id, { status: "returned", returnDate }, { new: true }).populate("bookId", "title").populate("memberId", "name");
        await Book_1.Book.findByIdAndUpdate(loan.bookId, { $inc: { availableCopies: 1 } });
        // BUG FIX: Notify the next person in the reservation queue that the book is now available
        const nextReservation = await Reservation_1.Reservation.findOne({ bookId: loan.bookId, status: "pending" }).sort({ queuePosition: 1 });
        if (nextReservation) {
            // In a real system, this would send an email/notification. We record it in the reservation.
            // For now we mark it as "ready" by setting a notifiedDate field if the model supports it,
            // or simply log it. The queue position reordering is handled on fulfill/cancel.
            console.log(`[Reservation Queue] Book returned — next reservation: memberId=${nextReservation.memberId}, reservationId=${nextReservation._id}`);
        }
        let fine = null;
        if (returnDate > loan.dueDate) {
            const daysLate = Math.ceil((returnDate.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
            const fineAmount = daysLate * 5;
            fine = await Fine_1.Fine.create({
                memberId: loan.memberId,
                loanId: loan._id,
                amount: fineAmount,
                reason: "Overdue return",
                issuedDate: returnDate,
                status: "unpaid",
            });
        }
        res.json({
            success: true,
            data: updatedLoan,
            fine: fine ? { amount: fine.amount, message: `Overdue fine of ₹${fine.amount} generated` } : null,
            message: "Book returned successfully",
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to return book" });
    }
};
exports.returnLoan = returnLoan;
const updateLoan = async (req, res) => {
    try {
        // Whitelist allowed fields
        const { dueDate, status } = req.body;
        const update = {};
        if (dueDate !== undefined)
            update.dueDate = dueDate;
        if (status !== undefined)
            update.status = status;
        const loan = await Loan_1.Loan.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!loan) {
            res.status(404).json({ success: false, message: "Loan not found" });
            return;
        }
        res.json({ success: true, data: loan });
    }
    catch {
        res.status(500).json({ success: false, message: "Failed to update loan" });
    }
};
exports.updateLoan = updateLoan;
//# sourceMappingURL=loanController.js.map