import jwt from 'jsonwebtoken';
import { Request,Response, NextFunction } from 'express';
import dotenv from 'dotenv'
dotenv.config();
export const verifyToken = (req: Request, res: Response, next: NextFunction) =>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({success: false, message: ' No token provided'});
    }
    try {
        const secret = process.env.JWT_SECRET_ACCESS_TOKEN|| process.env.JWT_SECRET
        if(!secret){
            throw new Error('JWT secret is not defind');
        }
        const decoded = jwt.verify(token, secret) as {user_id: string, user_role: string}
        req.user = decoded;
        next();
    } catch (error) {
        
    }
}