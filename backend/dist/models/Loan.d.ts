import mongoose, { Document, Types } from "mongoose";
export interface ILoan extends Document {
    bookId: Types.ObjectId;
    memberId: Types.ObjectId;
    issueDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: "active" | "overdue" | "returned";
    createdAt: Date;
    updatedAt: Date;
}
export declare const Loan: mongoose.Model<ILoan, {}, {}, {}, mongoose.Document<unknown, {}, ILoan, {}, {}> & ILoan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
