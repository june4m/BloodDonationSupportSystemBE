
// là xác thực phân quyền staff,admin,member

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Lấy token từ cookie hoặc header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const secret = process.env.JWT_SECRET_ACCESS_TOKEN || process.env.JWT_SECRET!;
      const decoded: any = jwt.verify(token, secret);
      if (!roles.includes(decoded.user_role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
} 


