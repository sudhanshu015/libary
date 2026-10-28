import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function login(req: Request, res: Response): Promise<void>;
export declare function getMe(req: AuthRequest, res: Response): Promise<void>;
export declare function logout(_req: Request, res: Response): Promise<void>;
