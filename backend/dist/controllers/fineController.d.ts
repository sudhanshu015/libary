import { Request, Response } from "express";
export declare const getFines: (req: Request, res: Response) => Promise<void>;
export declare const getFine: (req: Request, res: Response) => Promise<void>;
export declare const createFine: (req: Request, res: Response) => Promise<void>;
export declare const payFine: (req: Request, res: Response) => Promise<void>;
export declare const waiveFine: (req: Request, res: Response) => Promise<void>;
export declare const getFinesSummary: (_req: Request, res: Response) => Promise<void>;
