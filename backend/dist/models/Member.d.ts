import mongoose, { Document } from "mongoose";
export interface IMember extends Document {
    name: string;
    email: string;
    phone: string;
    membershipType: "standard" | "premium" | "student";
    joinDate: Date;
    status: "active" | "suspended" | "expired";
    createdAt: Date;
    updatedAt: Date;
}
export declare const Member: mongoose.Model<IMember, {}, {}, {}, mongoose.Document<unknown, {}, IMember, {}, {}> & IMember & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
