import mongoose, { Document } from "mongoose";
export interface IBook extends Document {
    title: string;
    author: string;
    isbn: string;
    genre: string;
    publishedYear: number;
    totalCopies: number;
    availableCopies: number;
    coverColor: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Book: mongoose.Model<IBook, {}, {}, {}, mongoose.Document<unknown, {}, IBook, {}, {}> & IBook & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
