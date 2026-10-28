import { Request, Response } from "express";
export declare const getReservations: (req: Request, res: Response) => Promise<void>;
export declare const getReservation: (req: Request, res: Response) => Promise<void>;
export declare const createReservation: (req: Request, res: Response) => Promise<void>;
export declare const fulfillReservation: (req: Request, res: Response) => Promise<void>;
export declare const cancelReservation: (req: Request, res: Response) => Promise<void>;
