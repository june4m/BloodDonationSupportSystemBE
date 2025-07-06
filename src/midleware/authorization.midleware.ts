import { RequestHandler } from 'express'


/**
 * Middleware phân quyền: kiểm tra user_role
 * Chỉ trả void, không return Response
 */
export const authorize = (allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user
    console.log('[DEBUG][Authorize] user:', user); // DEBUG
    if (!user?.user_role) {
      console.warn('[BUG][Authorize] Không có user_role, trả về 403'); // DEBUG
      res.status(403).json({ success: false, message: 'Unauthorized' })
      return
    }
    if (!allowedRoles.includes(user.user_role)) {
      console.warn(`[BUG][Authorize] user_role ${user.user_role} không thuộc allowedRoles ${allowedRoles}, trả về 403`); // DEBUG
      res
        .status(403)
        .json({ success: false, message: 'Forbidden: Insufficient permissions' })
      return
    }
    next()
  }
}