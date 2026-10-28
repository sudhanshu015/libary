"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReservation = exports.fulfillReservation = exports.createReservation = exports.getReservation = exports.getReservations = void 0;
const Reservation_1 = require("../models/Reservation");
const Book_1 = require("../models/Book");
const Member_1 = require("../models/Member");
const Loan_1 = require("../models/Loan");
// Auto-expire old reservations
const markExpiredReservations = async () => {
    await Reservation_1.Reservation.updateMany({ status: "pending", expiryDate: { $lt: new Date() } }, { $set: { status: "expired" } });
};
// GET /api/reservations
const getReservations = async (req, res) => {
    try {
        await markExpiredReservations();
        const { search, status, page = "1", limit = "50" } = req.query;
        const query = {};
        if (status && typeof status === "string")
            query.status = status;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const [reservations, total] = await Promise.all([
            Reservation_1.Reservation.find(query)
                .populate("bookId", "title author coverColor")
                .populate("memberId", "name email")
                .sort({ reservationDate: -1 })
                .skip(skip)
                .limit(limitNum),
            Reservation_1.Reservation.countDocuments(query),
        ]);
        let data = reservations.map((r) => {
            const book = r.bookId;
            const member = r.memberId;
            return {
                ...r.toJSON(),
                bookTitle: book?.title || "",
                memberName: member?.name || "",
            };
        });
        if (search && typeof search === "string") {
            const s = search.toLowerCase();
            data = data.filter((r) => r.bookTitle.toLowerCase().includes(s) || r.memberName.toLowerCase().includes(s));
        }
        res.json({
            success: true,
            data,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch reservations", error });
    }
};
exports.getReservations = getReservations;
// GET /api/reservations/:id
const getReservation = async (req, res) => {
    try {
        const reservation = await Reservation_1.Reservation.findById(req.params.id)
            .populate("bookId", "title author isbn coverColor")
            .populate("memberId", "name email phone");
        if (!reservation) {
            res.status(404).json({ success: false, message: "Reservation not found" });
            return;
        }
        res.json({ success: true, data: reservation });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch reservation", error });
    }
};
exports.getReservation = getReservation;
// POST /api/reservations
const createReservation = async (req, res) => {
    try {
        const { bookId, memberId, expiryDays = 30 } = req.body;
        const book = await Book_1.Book.findById(bookId);
        if (!book) {
            res.status(404).json({ success: false, message: "Book not found" });
            return;
        }
        // BUG FIX: Reservations are for unavailable books; if copies are available, just issue a loan
        if (book.availableCopies > 0) {
            res.status(400).json({ success: false, message: "This book is currently available — please issue a loan directly instead of reserving" });
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
        // Check if member already has a pending reservation for this book
        const existing = await Reservation_1.Reservation.findOne({ bookId, memberId, status: "pending" });
        if (existing) {
            res.status(400).json({ success: false, message: "Member already has a pending reservation for this book" });
            return;
        }
        // Determine queue position
        const pendingCount = await Reservation_1.Reservation.countDocuments({ bookId, status: "pending" });
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(expiryDays));
        const reservation = await Reservation_1.Reservation.create({
            bookId,
            memberId,
            expiryDate,
            status: "pending",
            queuePosition: pendingCount + 1,
        });
        const populated = await Reservation_1.Reservation.findById(reservation._id)
            .populate("bookId", "title author")
            .populate("memberId", "name email");
        res.status(201).json({ success: true, data: populated, message: "Reservation created successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to create reservation", error });
    }
};
exports.createReservation = createReservation;
// PUT /api/reservations/:id/fulfill
const fulfillReservation = async (req, res) => {
    try {
        const reservation = await Reservation_1.Reservation.findById(req.params.id);
        if (!reservation) {
            res.status(404).json({ success: false, message: "Reservation not found" });
            return;
        }
        if (reservation.status !== "pending") {
            res.status(400).json({ success: false, message: `Reservation is already ${reservation.status}` });
            return;
        }
        // BUG FIX: Check the book has available copies before fulfilling
        const book = await Book_1.Book.findById(reservation.bookId);
        if (!book) {
            res.status(404).json({ success: false, message: "Book not found" });
            return;
        }
        if (book.availableCopies <= 0) {
            res.status(400).json({ success: false, message: "No copies available to fulfill this reservation" });
            return;
        }
        // BUG FIX: Create an actual Loan record when fulfilling the reservation
        const { dueDays = 14 } = req.body;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Number(dueDays));
        await Loan_1.Loan.create({
            bookId: reservation.bookId,
            memberId: reservation.memberId,
            dueDate,
            status: "active",
        });
        // BUG FIX: Decrement available copies now that the book is issued
        await Book_1.Book.findByIdAndUpdate(reservation.bookId, { $inc: { availableCopies: -1 } });
        const updated = await Reservation_1.Reservation.findByIdAndUpdate(req.params.id, { status: "fulfilled" }, { new: true }).populate("bookId", "title").populate("memberId", "name");
        // Reorder remaining queue positions for this book
        const remaining = await Reservation_1.Reservation.find({ bookId: reservation.bookId, status: "pending" }).sort({ queuePosition: 1 });
        for (let i = 0; i < remaining.length; i++) {
            await Reservation_1.Reservation.findByIdAndUpdate(remaining[i]._id, { queuePosition: i + 1 });
        }
        res.json({ success: true, data: updated, message: "Reservation fulfilled and loan created" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fulfill reservation", error });
    }
};
exports.fulfillReservation = fulfillReservation;
// PUT /api/reservations/:id/cancel
const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation_1.Reservation.findById(req.params.id);
        if (!reservation) {
            res.status(404).json({ success: false, message: "Reservation not found" });
            return;
        }
        if (reservation.status !== "pending") {
            res.status(400).json({ success: false, message: `Reservation is already ${reservation.status}` });
            return;
        }
        await Reservation_1.Reservation.findByIdAndUpdate(req.params.id, { status: "cancelled" });
        // Reorder queue
        const remaining = await Reservation_1.Reservation.find({ bookId: reservation.bookId, status: "pending" }).sort({ queuePosition: 1 });
        for (let i = 0; i < remaining.length; i++) {
            await Reservation_1.Reservation.findByIdAndUpdate(remaining[i]._id, { queuePosition: i + 1 });
        }
        res.json({ success: true, message: "Reservation cancelled" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to cancel reservation", error });
    }
};
exports.cancelReservation = cancelReservation;
//# sourceMappingURL=reservationController.js.map