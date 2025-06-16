

import { Request, Response, NextFunction } from "express";


export const authorize = (allowedRoles: string[]) =>{
    return (
        req: Request, 
        res: Response,
        next: NextFunction
        ) =>{
        const user = req.user;
        if(!user || !user.user_role){
            return res.status(403).json({success: false, message:'Unauthorized'});
        }
        if(!allowedRoles.includes(user.user_role)){
            return res.status(403).json({success: false, message: 'Forbidden: Insufficient permissions'});
        }
        next();
    }
}