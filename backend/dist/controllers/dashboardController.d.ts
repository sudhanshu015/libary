import { Request, Response } from "express";
export declare const getDashboardStats: (_req: Request, res: Response) => Promise<void>;
export declare const getLoansByMonth: (_req: Request, res: Response) => Promise<void>;
export declare const getLoansByGenre: (_req: Request, res: Response) => Promise<void>;
export declare const getRecentLoans: (_req: Request, res: Response) => Promise<void>;
export declare const getLowStockBooks: (_req: Request, res: Response) => Promise<void>;
