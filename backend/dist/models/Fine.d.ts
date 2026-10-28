import mongoose, { Document, Types } from "mongoose";
export interface IFine extends Document {
    memberId: Types.ObjectId;
    loanId: Types.ObjectId;
    amount: number;
    reason: string;
    issuedDate: Date;
    paidDate?: Date;
    status: "unpaid" | "paid" | "waived";
    createdAt: Date;
    updatedAt: Date;
}
export declare const Fine: mongoose.Model<IFine, {}, {}, {}, mongoose.Document<unknown, {}, IFine, {}, {}> & IFine & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
