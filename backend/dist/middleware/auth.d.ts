import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";
export interface AuthRequest extends Request {
    user?: IUser;
}
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function authorizeAdmin(req: AuthRequest, res: Response, next: NextFunction): void;
