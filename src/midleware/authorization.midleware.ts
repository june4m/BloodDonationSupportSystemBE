import { RequestHandler } from 'express'


/**
 * Middleware phân quyền: kiểm tra user_role
 * Chỉ trả void, không return Response
 */
export const authorize = (allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user
    if (!user?.user_role) {
      res.status(403).json({ success: false, message: 'Unauthorized' })
      return
    }
    if (!allowedRoles.includes(user.user_role)) {
      res
        .status(403)
        .json({ success: false, message: 'Forbidden: Insufficient permissions' })
      return
    }
    next()
  }
}