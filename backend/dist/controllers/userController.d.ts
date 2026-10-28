import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function listUsers(_req: AuthRequest, res: Response): Promise<void>;
export declare function createUser(req: AuthRequest, res: Response): Promise<void>;
export declare function updateUser(req: AuthRequest, res: Response): Promise<void>;
export declare function deactivateUser(req: AuthRequest, res: Response): Promise<void>;
