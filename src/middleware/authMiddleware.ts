import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface UserPayload {
  user_id: string
  user_email: string
  user_name: string
  user_role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(401).json({ message: 'Token does not exist!' })
    return
  }

  try {
    const secret = process.env.JWT_SECRET_ACCESS_TOKEN || process.env.JWT_SECRET!
    const decoded = jwt.verify(token, secret) as UserPayload
    req.user = decoded
    next()
  } catch (error) {
    res.status(403).json({ message: 'Invalid Token!' })
    return
  }
}
