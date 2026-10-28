import { Request, Response } from "express";
export declare const getLoans: (req: Request, res: Response) => Promise<void>;
export declare const getLoan: (req: Request, res: Response) => Promise<void>;
export declare const createLoan: (req: Request, res: Response) => Promise<void>;
export declare const returnLoan: (req: Request, res: Response) => Promise<void>;
export declare const updateLoan: (req: Request, res: Response) => Promise<void>;
