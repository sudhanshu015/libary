import mongoose, { Document, Types } from "mongoose";
export interface IReservation extends Document {
    bookId: Types.ObjectId;
    memberId: Types.ObjectId;
    reservationDate: Date;
    expiryDate: Date;
    status: "pending" | "fulfilled" | "cancelled" | "expired";
    queuePosition: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Reservation: mongoose.Model<IReservation, {}, {}, {}, mongoose.Document<unknown, {}, IReservation, {}, {}> & IReservation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
