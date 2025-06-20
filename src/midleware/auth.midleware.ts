import { RequestHandler } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { TokenPayLoad } from '~/models/schemas/requests/user.requests'

dotenv.config()

// Middleware xác thực JWT: sử dụng jwt.verify đồng bộ
export const verifyToken: RequestHandler = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' })
    return
  }

  try {
    const secret = process.env.JWT_SECRET_ACCESS_TOKEN || process.env.JWT_SECRET!
    // Xác thực đồng bộ, nếu sai sẽ throw
    const decoded = jwt.verify(token, secret) as JwtPayload
    // Gán payload vào req.user
    req.user = decoded as TokenPayLoad
    next()
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' })
    return
  }
}
